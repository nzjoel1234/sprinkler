import { Injectable }    from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { ProgramSummary, Program, ProgramSchedule, ProgramScheduleType, ProgramStage } from './program';

@Injectable()
export class ProgramService {
  
  constructor(private http: Http) {
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
  
  deleteProgram(id: number): Promise<any> {
    return this.http
      .delete('api/programs/' + id)
      .toPromise()
      .catch(this.handleError);
  }
  
  // creates or updates program
  saveProgram(program: Program): Promise<any> {

    let url = program.programId > 0 ? `api/programs/${program.programId}` : 'api/programs'
    let body = JSON.stringify(program);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post(url, body, options)
      .toPromise()
      .catch(this.handleError);
  }
}