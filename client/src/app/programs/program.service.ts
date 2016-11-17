import { Injectable }    from '@angular/core';

import { AuthenticatedHttp } from '../authentication/authenticated-http.service';

import { ProgramSummary, Program, ProgramSchedule, ProgramScheduleType, ProgramStage } from './program';

@Injectable()
export class ProgramService {
  
  constructor(private http: AuthenticatedHttp) {
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  
  getPrograms(): Promise<ProgramSummary[]> {
    return this.http
      .get('api/programs')
      .toPromise()
      .then(response => {
        return response.json() as ProgramSummary[];
      })
      .catch(this.handleError);
  }
  
  getProgram(id: number): Promise<Program> {
    return this.http
      .get('api/programs/' + id)
      .toPromise()
      .then(response => {
        return response.json() as Program;
      })
      .catch(this.handleError);
  }
  
  deleteProgram(programId: number): Promise<any> {
    return this.http
      .delete('api/programs/' + programId)
      .toPromise()
      .catch(this.handleError);
  }
  
  // creates or updates program
  saveProgram(program: Program): Promise<any> {

    let url = program.programId > 0 ? `api/programs/${program.programId}` : 'api/programs'
    let body = JSON.stringify(program);

    return this.http
      .post(url, body)
      .toPromise()
      .catch(this.handleError);
  }
  
  startProgram(programId: number): Promise<any> {

    let url = `api/programs/${programId}/start`

    return this.http
      .post(url, "")
      .toPromise()
      .catch(this.handleError);
  }
}