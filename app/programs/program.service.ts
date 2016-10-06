import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import { Program, ProgramScheduleItem, ProgramScheduleType } from './program';

@Injectable()
export class ProgramService {
  
  constructor(private http: Http) {
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  
  getPrograms(): Promise<Program[]> {
    return this.http
      .get('api/programs')
      .toPromise()
      .then(response => {
        return (response.json() as any[])
          .map(jsonProgram => Program.fromJson(jsonProgram));
      })
      .catch(this.handleError);
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