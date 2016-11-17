import { Component } from '@angular/core';
import { Router }    from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { AuthenticationService, LoginError } from './authentication.service';
import { User } from './user';

@Component({
  selector: 'my-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  
  loginError: string;

  username: string;
  password: string;
  
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService) {
  }
  
  login() {
    this.authenticationService
      .login(this.username, this.password)
      .subscribe(
        result => this.afterLogin(),
        error => {
          if (error instanceof LoginError)
            return this.onLoginError(error);
          return Observable.throw(error);
        });
  }

  private onLoginError(error: LoginError) {
    this.loginError = error.message;
  }

  private afterLogin() {
    this.router.navigate(['']);
  }
}
