SELECT *
FROM
(
   SELECT
      ProgramStageDelay.ProgramId,
      ProgramStageDelay.ZoneId,
      ProgramStart.StartTime AS ProgramStartTime,
      ((ProgramStart.StartTime + ProgramStageDelay.Delay * 60) - CAST(strftime('%s','now') AS INTEGER)) AS StageStartIn,
      ((ProgramStart.StartTime + ProgramStageDelay.Delay * 60 + ProgramStageDelay.Minutes * 60) - CAST(strftime('%s','now') AS INTEGER)) AS StageEndIn
   FROM ProgramStart
   INNER JOIN ProgramStageDelay
      ON ProgramStart.ProgramId = ProgramStageDelay.ProgramId
) StageStart
WHERE StageStart.StageStartIn < 0
      AND StageStart.StageEndIn > 0
ORDER BY StageStart.ProgramStartTime

