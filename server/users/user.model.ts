import dataAccess = require('../data-access');
import passwordHash = require('password-hash');

const LOCKOUT_SECONDS = 20;
const MAX_ATTEMPTS = 5;

export class User {
  username: string;
}

export class UserLockedOutError extends Error {
  error: 'User locked out';
}

export class InvalidUserError extends Error {
  error: 'Invalid user';
}

export class InvalidPasswordError extends Error {
  constructor(public error: string) {
    super()
  }
}

export class NotFoundError extends Error {
  error: 'Not Found';
}

function validatePassword(password: string): Promise<any> {
  return Promise.resolve()
    .then(() => !!password && password.length >= 5)
    .then(valid => { if (!valid) throw new InvalidPasswordError('Password must be at least 5 characters long') });
}

export function createUser(username: string, password: string): Promise<any> {
  return Promise.resolve()
    .then(() => validatePassword(password))
    .then(() => passwordHash.generate(password))
    .then(hashedPassword =>
      dataAccess.invoke(db =>
        db.run(`
          INSERT INTO User (Username, HashedPassword)
          VALUES ($username, $hashedPassword)
        `, { $username: username, $hashedPassword: hashedPassword })
      )
    );
}

export function changePassword(username: string, newPassword: string): Promise<any> {
  return Promise.resolve()
    .then(() => validatePassword(newPassword))
    .then(() => passwordHash.generate(newPassword))
    .then(hashedPassword =>
      dataAccess.invoke(db =>
        db.run(`
          UPDATE User
          SET HashedPassword = $hashedPassword
          WHERE Username = $username
        `, { $username: username, $hashedPassword: hashedPassword })
        .then(() => db.get('select changes() as changes'))
        .then(row => {
          if (!row.changes) throw new NotFoundError();
        }
      )
    )
  );
}

export function verifyUser(username: string, password: string): Promise<User> {
  return dataAccess.invoke(db =>
    db.get(`
      SELECT
        Username as username,
        HashedPassword as hashedPassword,
        ((IFNULL(LockoutTime, 0) + $lockoutSeconds) > CAST(strftime('%s', 'now', 'localtime') AS INTEGER)) as lockedOut
      FROM User
      WHERE Username = $username
    `, { $username: username, $lockoutSeconds: LOCKOUT_SECONDS })
    .then(verifyUserResult => {

      if (!verifyUserResult)
        throw new InvalidUserError();

      if (verifyUserResult.lockedOut)
        throw new UserLockedOutError();

      if (!passwordHash.verify(password, verifyUserResult.hashedPassword)) {
         return db.run(`
          UPDATE User
          SET FailedLoginCount = FailedLoginCount + 1
          WHERE Username = $username
        `, { $username: username })
        .then(() => db.run(`
          UPDATE User
          SET LockoutTime = CAST(strftime('%s', 'now', 'localtime') AS INTEGER),
              FailedLoginCount = 0
          WHERE Username = $username
                AND FailedLoginCount >= $maxAttempts;
        `, { $username: username, $maxAttempts: MAX_ATTEMPTS }))
        .then(() => db.get('select changes() as changes'))
        .then(row => {
          if (row.changes) throw new UserLockedOutError();
          throw new InvalidUserError();
        })
        .then(() => null);
      }

      return db.run(`
        UPDATE User
        SET FailedLoginCount = 0
        WHERE Username = $username
      `, { $username: username })
      .then(() => ({ username: verifyUserResult.username }));
    })
  );
}
