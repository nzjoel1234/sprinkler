export class Program {
  id: number;
  name: string;
  programScheduleType: ProgramScheduleType;
  startTimeHours: number;
  startTimeMinutes: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export enum ProgramScheduleType {
  ManualOnly = 0,
  AllDays = 1,
  OddDays = 2,
  EvenDays = 3,
  DaysOfWeek = 4
}
