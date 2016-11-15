
CREATE TABLE `ManualStop` (
   `ManualStopId`  INTEGER NOT NULL PRIMARY KEY,
   `StopTime`       INTEGER NOT NULL
);

INSERT INTO ManualStop (ManualStopId, StopTime)
VALUES (1, 0);

DROP VIEW IF EXISTS ScheduledStage;

CREATE VIEW ScheduledStage AS
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
   WHERE ProgramStart.StartTime > (SELECT StopTime FROM ManualStop WHERE ManualStopId = 1)
   GROUP BY ProgramStart.ManualStartId, ProgramStart.ProgramId, ProgramStart.StartTime
) Program
INNER JOIN ProgramStageDelay
  ON Program.ProgramId = ProgramStageDelay.ProgramId;

PRAGMA user_version = 3;
