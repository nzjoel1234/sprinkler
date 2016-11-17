import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent }          from './authentication/login.component';
import { LoggedInGuard }           from './authentication/logged-in.guard';

import { SprinklerComponent }      from './sprinkler.component'

import { ProgramsComponent }       from './programs/programs.component';
import { ProgramDetailComponent }  from './programs/program-detail.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/sprinkler/programs',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'sprinkler',
    component: SprinklerComponent,
    canActivate: [ LoggedInGuard ],
    children: [
      {
        path: 'programs',
        component: ProgramsComponent
      },
      {
        path: 'programs/:id',
        component: ProgramDetailComponent
      }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);