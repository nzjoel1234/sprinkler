
CREATE TABLE `Zone` (
	`ZoneId`	INTEGER NOT NULL PRIMARY KEY,
	`Name`	TEXT NOT NULL
);

INSERT INTO Zone (ZoneId, Name)
VALUES (1, 'Road'),
       (2, 'Driveway'),
       (3, 'House');

CREATE TABLE `Program` (
	`ProgramId`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`Name`	TEXT NOT NULL
);

CREATE TABLE `ProgramStage` (
	`ProgramStageId`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`ProgramId`	INTEGER NOT NULL,
	`OrderId`	INTEGER NOT NULL,
	`ZoneId`	INTEGER NOT NULL,
	`Minutes`	INTEGER NOT NULL,
	FOREIGN KEY(`ProgramId`) REFERENCES Program (ProgramId),
	FOREIGN KEY(`ZoneId`) REFERENCES Zone (ZoneId)
);

CREATE TABLE `ProgramSchedule` (
	`ProgramScheduleId`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`ProgramId`	INTEGER NOT NULL,
	`ScheduleType`	INTEGER NOT NULL,
	`StartTimeHours`	INTEGER NOT NULL,
	`StartTimeMinutes`	INTEGER NOT NULL,
	FOREIGN KEY(`ProgramId`) REFERENCES Program (ProgramId)
);

PRAGMA user_version = 1;