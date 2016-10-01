import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { User } from './user';

@Injectable()
export class AuthenticationService {

  constructor(private http: Http) {
  }

  login(username: string, password: string): Observable<Boolean> {

    return Observable
      .of(username == "joel")
      .do(result => {
        if (result)
          localStorage.setItem('auth_token', 'not-a-real-token');
        return result;
      });

    /*
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http
      .post(
        '/login',
        JSON.stringify({ username, password }), 
        { headers }
      )
      .map(res => res.json())
      .map((res) => {
        if (res.success) {
          localStorage.setItem('auth_token', res.auth_token);
        }

        return res.success;
      });
      */
  }
  
  logout() {
    localStorage.removeItem('auth_token');
  }

  getCurrentUser(): User {
    var auth_token = localStorage.getItem('auth_token');

    if (!auth_token) {
      return null;
    }

    // build user from auth_token
    var user = new User();
    user.username = 'joel';
    user.roles = ['administrator'];
    return user;
  }
}