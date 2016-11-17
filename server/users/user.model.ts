import dataAccess = require('../data-access');
import passwordHash = require('password-hash');

export class NotFoundError extends Error { }

export function createUser(username: string, password: string): Promise<any> {
  var hashedPassword = passwordHash.generate(password);
  return dataAccess.invoke(db =>
    db.run(`
      INSERT INTO User (Username, HashedPassword)
      VALUES($username, $hashedPassword)
    `, { $username: username, $hashedPassword: hashedPassword })
  );
}

export function verifyUser(username: string, password: string): Promise<Boolean> {
  var hashedPassword = passwordHash.generate(password);
  return dataAccess.invoke(db =>
    db.get(`
      SELECT Username
      FROM User
      WHERE Username = $username
            AND HashedPassword = $hashedPassword
    `, { $username: username, $hashedPassword: hashedPassword })
    .then(row => !!row)
  );
}
