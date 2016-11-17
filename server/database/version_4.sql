
CREATE TABLE `User` (
   `Username`         TEXT NOT NULL PRIMARY KEY,
   `HashedPassword`   TEXT NOT NULL,
   `FailedLoginCount` INTEGER NOT NULL DEFAULT 0,
   `LockoutTime`      INTEGER NULL
);

-- seed username/password => admin/admin
INSERT INTO User (Username, HashedPassword)
VALUES ('admin', 'sha1$5cac1548$1$b8123742bddd856392c9b5cbd6debfab3771aa02');

PRAGMA user_version = 4;
