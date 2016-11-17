import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService) {}

  canActivate(): boolean {
    if (!!this.authenticationService.getCurrentUser()) return true;
    this.router.navigate(['login']);
    return false;
  }
}