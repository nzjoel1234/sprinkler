import { Zone } from './../zones/zone';

export class Program {
  id: number;
  name: string;
  scheduleItems: ProgramScheduleItem[];
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
  
  constructor() {
    this.scheduleItems = [];
  }
  
  getRunningTime(): number {
    return this.scheduleItems
      .map(item => item.minutes)
      .reduce((prev, curr) => prev + curr, 0);
  }
}

export class ProgramScheduleItem {
  zone: Zone;
  minutes: number;
}

export enum ProgramScheduleType {
  ManualOnly = 0,
  AllDays = 1,
  OddDays = 2,
  EvenDays = 3,
  DaysOfWeek = 4
}
