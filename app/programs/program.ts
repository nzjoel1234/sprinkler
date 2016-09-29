import { Zone } from './../zones/zone';

export class Program {
  id: number = 0;
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
  
  getRunningTime(): number {
    return this.scheduleItems
      .map(item => item.minutes)
      .reduce((prev, curr) => prev + curr, 0);
  }
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
