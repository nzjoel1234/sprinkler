
CREATE TABLE `ProgramStart` (
	`ProgramStartId`  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`ProgramId`       INTEGER NOT NULL,
	`StartTime`       INTEGER NOT NULL,
	FOREIGN KEY(`ProgramId`) REFERENCES Program (ProgramId)
);

CREATE VIEW ProgramStageDelay AS
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
    ON ProgramStage.ProgramStageId = PreStages.ProgramStageId

PRAGMA user_version = 2;