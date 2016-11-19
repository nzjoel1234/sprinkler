import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { AuthenticatedHttp } from '../authentication/authenticated-http.service';

import {
  ProgramSummary,
  Program,
  ProgramSchedule,
  ProgramScheduleType,
  ProgramStage,
  SprinklerStatus } from './program';

@Injectable()
export class ProgramService {
  
  sprinklerStatus$: ReplaySubject<SprinklerStatus>

  constructor(private http: AuthenticatedHttp) {
    this.sprinklerStatus$ = new ReplaySubject<SprinklerStatus>(1);
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
      .catch(error => this.handleError(error));
  }
  
  getProgram(id: number): Promise<Program> {
    return this.http
      .get('api/programs/' + id)
      .toPromise()
      .then(response => {
        return response.json() as Program;
      })
      .catch(error => this.handleError(error));
  }
  
  deleteProgram(programId: number): Promise<any> {
    return this.http
      .delete('api/programs/' + programId)
      .toPromise()
      .then(() => this.updateSprinklerStatus())
      .catch(error => this.handleError(error));
  }
  
  // creates or updates program
  saveProgram(program: Program): Promise<any> {

    let url = program.programId > 0 ? `api/programs/${program.programId}` : 'api/programs'
    let body = JSON.stringify(program);

    return this.http
      .post(url, body)
      .toPromise()
      .then(() => this.updateSprinklerStatus())
      .catch(error => this.handleError(error));
  }
  
  startProgram(programId: number): Promise<any> {

    let url = `api/programs/${programId}/start`

    return this.http
      .post(url, "")
      .toPromise()
      .then(() => this.updateSprinklerStatus())
      .catch(error => this.handleError(error));
  }
  
  stopAll(): Promise<any> {

    let url = `api/programs/stop`

    return this.http
      .post(url, "")
      .toPromise()
      .then(() => this.updateSprinklerStatus())
      .catch(error => this.handleError(error));
  }

  updateSprinklerStatus(): Promise<any> {
    return this.http
      .get('api/programs/next-scheduled-stage')
      .map(response => response.json() as SprinklerStatus)
      .forEach(next => this.sprinklerStatus$.next(next));
  }
}