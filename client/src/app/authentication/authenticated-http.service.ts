import { Injectable } from '@angular/core';
import { Http, Request, RequestOptionsArgs, Response, XHRBackend, RequestOptions, ConnectionBackend, Headers} from '@angular/http';
import { Router} from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import { Observable } from 'rxjs/Observable';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticatedHttp {

  constructor(
    private http: Http,
    private router: Router,
    private authenticationService: AuthenticationService) {
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(this.http.request(url, this.getRequestOptionArgs(options)));
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(this.http.get(url, this.getRequestOptionArgs(options)));
  }

  post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {   
    return this.intercept(this.http.post(url, body, this.getRequestOptionArgs(options)));
  }

  put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(this.http.put(url, body, this.getRequestOptionArgs(options)));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(this.http.delete(url, this.getRequestOptionArgs(options)));
  }
  
  getRequestOptionArgs(options?: RequestOptionsArgs) : RequestOptionsArgs {
    if (options == null) {
        options = new RequestOptions();
    }
    if (options.headers == null) {
        options.headers = new Headers();
    }
    options.headers.append('Content-Type', 'application/json');
    //options.headers.append('Authorization', this.authenticationService.getAuthToken())
    return options;
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable;
    /*
    return observable.catch((err, source) => {
      if (err.status == 401) {
        console.log('Redirect to login page...');
        this.router.navigate(['/login']);
        return Observable.empty();
      } else {
        return Observable.throw(err);
      }
    });
    */
  }
}