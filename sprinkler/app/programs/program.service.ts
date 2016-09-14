import { Injectable } from '@angular/core';

import { Program, ProgramScheduleType } from './program';

const PROGRAMS: Program[] = [
  {
    id: 1,
    name: 'Auto Program',
    programScheduleType: ProgramScheduleType.AllDays,
    startTimeHours: 4,
    startTimeMinutes: 15,
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: false
  },
  {
    id: 2,
    name: 'Manual Program',
    programScheduleType: ProgramScheduleType.ManualOnly,
    startTimeHours: 0,
    startTimeMinutes: 0,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  }
];

@Injectable()
export class ProgramService {
  
  getPrograms(): Promise<Program[]> {
    return Promise.resolve(PROGRAMS);
  }
  
  getProgram(id: number): Promise<Program> {
    return this.getPrograms()
               .then(programs => programs.find(program => program.id === id));
  }
  
}