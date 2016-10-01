import { Injectable } from '@angular/core';

import { Program, ProgramScheduleItem, ProgramScheduleType } from './program';

@Injectable()
export class ProgramService {
  
  programs: Program[];
  
  constructor() {
    let program1 = new Program()
    program1.programId = 1;
    program1.name = 'Program One';
    let program2 = new Program()
    program2.programId = 2;
    program2.name = 'Program Two';
    this.programs = [ program1, program2 ];
  }
  
  getPrograms(): Promise<Program[]> {
      return Promise.resolve(this.programs);
  }
  
  getProgram(id: number): Promise<Program> {
    return this
      .getPrograms()
      .then(programs => programs.find(program => program.programId === id));
  }

  getNewProgram(): Program {
    let newProgram = new Program()
    newProgram.name = 'New Program';
    return newProgram;
  }
}