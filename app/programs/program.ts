import { Zone } from './../zones/zone';

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
  
  getRunningTime(): number {
    return this.scheduleItems
      .map(item => item.minutes)
      .reduce((prev, curr) => prev + curr, 0);
  }

  public static fromJson(json: any): Program {
    let result = new Program();

    result.programId = json.programId;
    result.name = json.name;
    result.scheduleItems = json.scheduleItems;
    result.programScheduleType = json.programScheduleType;
    result.startTimeHours = json.startTimeHours;
    result.startTimeMinutes = json.startTimeMinutes;
    result.monday = json.monday;
    result.tuesday = json.tuesday;
    result.wednesday = json.wednesday;
    result.thursday = json.thursday;
    result.friday = json.friday;
    result.saturday = json.saturday;
    result.sunday = json.sunday;

    return result;
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
