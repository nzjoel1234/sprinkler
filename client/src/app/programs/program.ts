import { Zone } from './../zones/zone';

export class ProgramSummary {
  programId: number;
  name: string;
  totalMinutes: number;
  hasSchedule: boolean;
}

export class Program {
  programId: number = 0;
  name: string;
  stages: ProgramStage[] = [];
  schedules: ProgramSchedule[] = [];
}

export class ProgramSchedule {
  scheduleType: ProgramScheduleType = ProgramScheduleType.AllDays;
  startTimeHours: number = 0;
  startTimeMinutes: number = 0;
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

export class SprinklerStatus {
  programId: number;
  programName: string;
  zoneId: number;
  zoneName: string;
  programStartIn: number;
  programEndIn: number;
  stageStartIn: number;
  stageEndIn: number;
}