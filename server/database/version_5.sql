

DROP VIEW IF EXISTS AutoStart;

CREATE VIEW AutoStart AS
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
   ON Program.ScheduleType = 0
      OR ((Instant.Day % 2) = (Program.ScheduleType % 2));

PRAGMA user_version = 5;