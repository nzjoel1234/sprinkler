import { Component } from '@angular/core';
import { Router }    from '@angular/router';

import { AuthenticationService } from './authentication/authentication.service'

@Component({
  selector: 'my-sprinkler',
  templateUrl: './sprinkler.component.html',
  styleUrls: ['./sprinkler.component.css']
})
export class SprinklerComponent {
  public isNavbarCollapsed: boolean = true;

  public constructor(
    private router: Router,
    private authenticationService: AuthenticationService) {
  }

  getCurrentUser() {
    return this.authenticationService.getCurrentUser();
  }

  logout() {
    this.router.navigate(['login']).then(result => {
      if (result) this.authenticationService.logout();
    });
  }
}
