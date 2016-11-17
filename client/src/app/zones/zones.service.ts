import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'RxJs';

import { Zone } from './zone';

@Injectable()
export class ZonesService {

  constructor(private http: Http) {
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  
  getZones(): Promise<Zone[]> {
    return this.http
      .get('api/zones')
      .toPromise()
      .then(response => {
        return response.json() as Zone[];
      })
      .catch(this.handleError);
  }

}
