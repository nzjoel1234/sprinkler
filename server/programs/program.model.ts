export class Program {
  programId: number = 0;
  name: string;
  scheduleItems: ProgramScheduleItem[] = [];
  programScheduleType: ProgramScheduleType = ProgramScheduleType.ManualOnly;
  startTimeHours: number = 0;
  startTimeMinutes: number = 0;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export class ProgramScheduleItem {
  zoneId: number;
  minutes: number;
}

export enum ProgramScheduleType {
  ManualOnly = 0,
  AllDays = 1,
  OddDays = 2,
  EvenDays = 3,
  DaysOfWeek = 4
}