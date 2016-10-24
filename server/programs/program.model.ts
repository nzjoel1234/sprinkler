import dataAccess = require("../data-access");

export class ProgramSummary {
  programId: number;
  name: string;
  totalMinutes: number;
  hasSchedule: boolean;
}

export class Program {
  programId: number;
  name: string;
  stages: ProgramStage[];
  schedules: ProgramSchedule[];
}

export class ProgramSchedule {
  scheduleType: ProgramScheduleType;
  startTimeHours: number;
  startTimeMinutes: number;
}

export class ProgramStage {
  orderId: number;
  zoneId: number;
  minutes: number;
}

export enum ProgramScheduleType {
  AllDays = 0,
  OddDays = 1,
  EvenDays = 2
}

export class ScheduledStage {
  programId: number;
  programName: string;
  zoneId: number;
  zoneName: string;
  programStartIn: number;
  programEndIn: number;
  stageStartIn: number;
  stageEndIn: number;
}

export class NotFoundError extends Error { }

export function getPrograms(): Promise<ProgramSummary[]> {
  return dataAccess.invoke(db =>
    db.all(`
      SELECT
        p.ProgramId as programId,
        p.Name as name,
        IFNULL(stage.totalMinutes, 0) as totalMinutes,
        IFNULL(schedule.hasSchedule, 0) as hasSchedule
      FROM Program p
      LEFT JOIN
      (
        SELECT
          programId,
          1 as hasSchedule
        FROM ProgramSchedule
        GROUP BY programId
      ) schedule
        ON schedule.programId = p.programId
      LEFT JOIN
      (
        SELECT
          programId,
          SUM(minutes) totalMinutes
        FROM ProgramStage
        GROUP BY programId
      ) stage
        ON stage.programId = p.programId
    `)
    .then(programs => {
      if (!programs) programs = [];
      return programs.map(program => program as ProgramSummary);
    })
  );
}

export function getProgramDetail(programId: number): Promise<Program> {
  return dataAccess.invoke(db =>
    db.get(`
      SELECT
        ProgramId as programId,
        Name as name
      FROM Program
      WHERE ProgramId = $programId`,
      { $programId: programId })
    .then(program => {
      if (!program) throw new NotFoundError();
      return program as Program;
    })
    .then(program =>
      db.all(`
        SELECT
          ScheduleType as scheduleType,
          StartTimeHours as startTimeHours,
          StartTimeMinutes as startTimeMinutes
        FROM ProgramSchedule
        WHERE ProgramId = $programId`,
        { $programId: programId })
      .then(schedules => {
        if (!schedules) schedules = [];
        program.schedules = schedules.map(schedule => schedule as ProgramSchedule);
        return program;
      })
    )
    .then(program =>
      db.all(`
        SELECT
          OrderId as orderId,
          ZoneId as zoneId,
          Minutes as minutes
        FROM ProgramStage
        WHERE ProgramId = ${programId}
      `)
      .then(stages => {
        if (!stages) stages = [];
        program.stages = stages.map(stage => stage as ProgramStage);
        return program;
      })
    )
  );
}

export function deleteProgram(programId: number): Promise<any> {
  return dataAccess.invoke(db =>
    db.run('BEGIN TRANSACTION')
    .then(() =>
      db.run(`
        DELETE FROM ProgramSchedule
        WHERE ProgramId = $programId
      `, { $programId: programId })
      .then(() => db.run(`
        DELETE FROM ProgramStage
        WHERE ProgramId = $programId
      `, { $programId: programId }))
      .then(() => db.run(`
        DELETE FROM Program
        WHERE ProgramId = $programId
      `, { $programId: programId }))
      .then(() => db.run('END TRANSACTION'))
      .catch(error => {
        db.run('ROLLBACK TRANSACTION');
        throw error;
      })
  ));
}

export function create(program: Program): Promise<number> {
  return dataAccess.invoke(db =>
    db.run('BEGIN TRANSACTION')
    .then(() =>
      db.run(`
        INSERT INTO Program (Name)
        VALUES ($name)
      `, { $name: program.name })
      .then(() => db.get('SELECT last_insert_rowid() as programId'))
      .then(newRow => newRow.programId as number)
      .then(programId =>
        updateSchedules(db, programId, program.schedules)
        .then(() => updateStages(db, programId, program.stages))
        .then(() => db.run('END TRANSACTION'))
        .then(() => programId)
      )
      .catch(error => {
        db.run('ROLLBACK TRANSACTION');
        throw error;
      })
  ));
}

export function update(program: Program): Promise<number> {
  return dataAccess.invoke(db =>
    db.run('BEGIN TRANSACTION')
    .then(() =>
      db.run(`
        UPDATE Program
        SET Name = $name
        WHERE ProgramId = $programId
      `, { $name: program.name, $programId: program.programId })
      .then(() => db.run('select changes()'))
      .then(changes => {
        if (!changes) throw new NotFoundError();
      })
      .then(() => updateSchedules(db, program.programId, program.schedules))
      .then(() => updateStages(db, program.programId, program.stages))
      .then(() => db.run('END TRANSACTION'))
      .then(() => program.programId)
      .catch(error => {
        db.run('ROLLBACK TRANSACTION');
        throw error;
      })
  ));
}

function updateSchedules(db: dataAccess.SqliteConnection, programId: number, schedules: ProgramSchedule[]): Promise<any> {
  if (!schedules) schedules = [];

  let parameters = {};
  parameters[`$programId`] = programId;
  for (let index = 0; index < schedules.length; index++) {
    let schedule = schedules[index];
    parameters[`$scheduleType_${index}`] = schedule.scheduleType;
    parameters[`$startTimeHours_${index}`] = schedule.startTimeHours;
    parameters[`$startTimeMinutes_${index}`] = schedule.startTimeMinutes;
  }

  let valuesFormat = schedules.map((schedule, index) =>
    `(
      $programId,
      $scheduleType_${index},
      $startTimeHours_${index},
      $startTimeMinutes_${index}
    )`).join(',');

  return db.run(`
    DELETE FROM ProgramSchedule
    WHERE ProgramId = $programId`,
    { $programId: programId })
  .then(() => {
    if (schedules.length == 0) return;
    return db.run(`
      INSERT INTO ProgramSchedule (
        programId,
        scheduleType,
        startTimeHours,
        startTimeMinutes)
        VALUES ${valuesFormat}`,
      parameters);
  });
}

function updateStages(db: dataAccess.SqliteConnection, programId: number, stages: ProgramStage[]): Promise<any> {
  if (!stages) stages = [];

  let parameters = {};
  parameters[`$programId`] = programId;
  for (let index = 0; index < stages.length; index++) {
    let stage = stages[index];
    parameters[`$orderId_${index}`] = stage.orderId;
    parameters[`$zoneId_${index}`] = stage.zoneId;
    parameters[`$minutes_${index}`] = stage.minutes;
  }

  let valuesFormat = stages.map((stage, index) =>
    `(
      $programId,
      $orderId_${index},
      $zoneId_${index},
      $minutes_${index}
    )`).join(',');

  return db.run(`
    DELETE FROM ProgramStage
    WHERE programId = $programId`,
    { $programId: programId })
  .then(() => {
    if (stages.length == 0) return;
    return db.run(`
    INSERT INTO ProgramStage (
      programId,
      orderId,
      zoneId,
      minutes)
      VALUES ${valuesFormat}`,
      parameters);
  });
}

export function start(programId: number): Promise<any> {
  return dataAccess.invoke(db =>
    db.run('BEGIN TRANSACTION')
    .then(() =>
      db.run(`
        INSERT INTO ManualStart (ProgramId, StartTime)
        VALUES ($programId, CAST(strftime('%s', 'now', 'localtime') AS INTEGER))
      `, { $programId: programId })
      .then(() => db.run('select changes()'))
      .then(changes => {
        if (!changes) throw new NotFoundError();
      })
      .then(() => db.run('END TRANSACTION'))
      .catch(error => {
        db.run('ROLLBACK TRANSACTION');
        throw error;
      })
  ));
}

export function getNextScheduledStage(): Promise<ScheduledStage> {
  return dataAccess.invoke(db =>
      db.run(`
        DELETE FROM ManualStart
        WHERE ManualStartId IN
        (
          SELECT ManualStartId
          FROM ScheduledStage
          WHERE ScheduledStage.ProgramEndIn < 0
        )
      `)
      .then(() =>
        db.run(`
          DELETE FROM ManualStart
          WHERE ManualStartId IN
          (
              -- Remove programs which have ended
              SELECT ManualStartId
              FROM ScheduledStage
              WHERE ScheduledStage.ProgramEndIn < 0
            UNION
              -- Remove programs which have other programs which have started after them
              SELECT OlderScheduledStage.ManualStartId
              FROM ScheduledStage OlderScheduledStage
              INNER JOIN ScheduledStage NewerScheduledStage
                ON NewerScheduledStage.ProgramStartIn > OlderScheduledStage.ProgramStartIn
                  AND NewerScheduledStage.ProgramStartIn <= 0
          )
      `))
      .then(() =>
        db.get(`
          SELECT
            Program.ProgramId AS programId,
            Program.Name AS programName,
            Zone.ZoneId AS zoneId,
            Zone.Name AS zoneName,
            ScheduledStage.ProgramStartIn AS programStartIn,
            ScheduledStage.ProgramEndIn AS programEndIn,
            ScheduledStage.StageStartIn AS stageStartIn,
            ScheduledStage.StageEndIn AS stageEndIn
          FROM ScheduledStage
          INNER JOIN Program
            ON ScheduledStage.ProgramId = Program.ProgramId
          INNER JOIN Zone
            ON ScheduledStage.ZoneId = Zone.ZoneId
          WHERE StageEndIn > 0
          ORDER BY
            ProgramStartIn > 0, -- Already started programs first
            ProgramStartIn * ProgramStartIn, -- Want the unsigned start time so that the last started program goes first
            StageStartIn
          LIMIT 1
        `)
      )
      .then(stage => stage as ScheduledStage));
}
