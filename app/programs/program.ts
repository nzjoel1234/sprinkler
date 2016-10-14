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
  monday: boolean = true;
  tuesday: boolean = true;
  wednesday: boolean = true;
  thursday: boolean = true;
  friday: boolean = true;
  saturday: boolean = true;
  sunday: boolean = true;
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
