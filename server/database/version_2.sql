
CREATE TABLE `ManualStart` (
   `ManualStartId`  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
   `ProgramId`       INTEGER NOT NULL,
   `StartTime`       INTEGER NOT NULL,
   FOREIGN KEY(`ProgramId`) REFERENCES Program (ProgramId)
);


CREATE VIEW IF NOT EXISTS ProgramStageDelay AS
SELECT ProgramStage.ProgramId, ProgramStage.ZoneId, ProgramStage.Minutes, PreStages.Delay
FROM ProgramStage
INNER JOIN
(
    SELECT Stage.ProgramStageId, IFNULL(SUM(PreStage.Minutes), 0) as Delay
    FROM ProgramStage Stage
    LEFT JOIN ProgramStage PreStage
       ON Stage.ProgramId = PreStage.ProgramId
          AND Stage.OrderId > PreStage.OrderId
    GROUP BY Stage.ProgramStageId
) PreStages
    ON ProgramStage.ProgramStageId = PreStages.ProgramStageId;


CREATE VIEW IF NOT EXISTS AutoStart AS
SELECT
   Program.ProgramId AS ProgramId,
   Instant.StartOfDay + Program.StartTimeSeconds AS StartTime
FROM
(
   SELECT
      I.Instant,
      STRFTIME('%d', I.Instant, 'unixepoch') AS Day,
      STRFTIME('%s', I.Instant, 'unixepoch', 'start of day') AS StartOfDay
   FROM
   (
         SELECT CAST(STRFTIME('%s', 'now', 'localtime') AS INTEGER) AS Instant
      UNION
         SELECT CAST(STRFTIME('%s', 'now', 'localtime', '-2 days') AS INTEGER) AS Instant
      UNION
         SELECT CAST(STRFTIME('%s', 'now', 'localtime', '-1 days') AS INTEGER) AS Instant
      UNION
         SELECT CAST(STRFTIME('%s', 'now', 'localtime', '+1 days') AS INTEGER) AS Instant
      UNION
         SELECT CAST(STRFTIME('%s', 'now', 'localtime', '+2 days') AS INTEGER) AS Instant
   ) I
) Instant
INNER JOIN
(
   SELECT
      ProgramId,
     (StartTimeHours * 60 + StartTimeMinutes) * 60 AS StartTimeSeconds,
     ScheduleType
   FROM ProgramSchedule
) Program
   ON (Instant.Day % 2) = (Program.ScheduleType % 2);


CREATE VIEW IF NOT EXISTS ScheduledStage AS
SELECT
   Program.ManualStartId AS ManualStartId,
   Program.ProgramId AS ProgramId,
   Program.StartIn AS ProgramStartIn,
   Program.StartIn + Program.Minutes * 60 AS ProgramEndIn,
   ProgramStageDelay.ZoneId AS ZoneId,
   Program.StartIn + ProgramStageDelay.Delay * 60 AS StageStartIn,
   Program.StartIn + ProgramStageDelay.Delay * 60 + ProgramStageDelay.Minutes * 60 AS StageEndIn
FROM
(
   SELECT
      ProgramStart.ManualStartId,
      ProgramStart.ProgramId,
      ProgramStart.StartTime - CAST(strftime('%s','now', 'localtime') AS INTEGER) AS StartIn,
      SUM(ProgramStage.Minutes) AS Minutes
   FROM
   (
         SELECT ManualStartId, ProgramId, StartTime
         FROM ManualStart
      UNION
         SELECT NULL, ProgramId, StartTime
         FROM AutoStart
   ) ProgramStart
   INNER JOIN ProgramStage
      ON ProgramStart.ProgramId = ProgramStage.ProgramId
   GROUP BY ProgramStart.ManualStartId, ProgramStart.ProgramId, ProgramStart.StartTime
) Program
INNER JOIN ProgramStageDelay
  ON Program.ProgramId = ProgramStageDelay.ProgramId;

PRAGMA user_version = 2;
