import { Component, OnInit } from '@angular/core';
import { Router }    from '@angular/router';

import { AuthenticationService } from './authentication.service';
import { User } from './user';

@Component({
  selector: 'my-login',
  templateUrl: 'app/authentication/login.component.html'
})
export class LoginComponent implements OnInit {
  
  username: string;
  password: string;
  
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService) {
  }
  
  ngOnInit(): void {
    if (!!this.authenticationService.getCurrentUser()) {
      this.authenticationService.logout();
    }
  }

  login(): void {
    this.authenticationService
      .login(this.username, this.password)
      .subscribe(result => {
        if (result) {
          this.afterLogin();
        } else {
          alert('login failed');
        }
      });
  }

  private afterLogin(): void {
    this.router.navigate(['']);
  }
}
