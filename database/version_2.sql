
CREATE TABLE `ProgramStart` (
	`ProgramStartId`  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

CREATE VIEW IF NOT EXISTS ScheduledStage AS
SELECT
   Program.ProgramStartId AS ProgramStartId,
   Program.ProgramId AS ProgramId,
   Program.StartIn AS ProgramStartIn,
   Program.StartIn + Program.Minutes * 60 AS ProgramEndIn,
   ProgramStageDelay.ZoneId AS ZoneId,
   Program.StartIn + ProgramStageDelay.Delay * 60 AS StageStartIn,
   Program.StartIn + ProgramStageDelay.Delay * 60 + ProgramStageDelay.Minutes * 60 AS StageEndIn
FROM
(
   SELECT
      ProgramStart.ProgramStartId,
      ProgramStart.ProgramId,
      ProgramStart.StartTime - CAST(strftime('%s','now') AS INTEGER) AS StartIn,
      SUM(ProgramStage.Minutes) AS Minutes
   FROM ProgramStart
   INNER JOIN ProgramStage
      ON ProgramStart.ProgramId = ProgramStage.ProgramId
   GROUP BY ProgramStart.ProgramStartId, ProgramStart.ProgramId, ProgramStart.StartTime
) Program
INNER JOIN ProgramStageDelay
  ON Program.ProgramId = ProgramStageDelay.ProgramId;

PRAGMA user_version = 2;
