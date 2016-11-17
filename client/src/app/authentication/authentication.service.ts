import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { User } from './user';

export class LoginError extends Error {
  constructor(public message: string) { super(); }
}

interface IAuthDetails {
  username: string,
  token: string
}

@Injectable()
export class AuthenticationService {

  constructor(private http: Http) {
  }

  login(username: string, password: string): Observable<User> {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify({ username, password });

    return this.http
      .post('/api/login', body, options)
      .map(res => {
        localStorage.setItem('auth_details', JSON.stringify({
          username,
          token: `Basic ${btoa(username + ":" + password)}`
        }));
        return { username };
      })
      .catch((error) => {
        if (error.status == 403) {
          return Observable.throw(new LoginError(error.json().error));
        }
        return Observable.throw(new Error(error.status));
      });
  }

  private getAuthDetails(): IAuthDetails {
    var auth_details = localStorage.getItem('auth_details');

    if (!auth_details) {
      return null;
    }

    return JSON.parse(auth_details);
  }

  getAuthToken() {
    let details = this.getAuthDetails();
    return details ? details.token : null;
  }
  
  getCurrentUser(): User {
    let details = this.getAuthDetails();
    return details ? { username: details.username } : null;
  }

  logout() {
    localStorage.removeItem('auth_details');
  }
}
