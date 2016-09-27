import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProgramsComponent }       from './programs/programs.component';
import { ProgramDetailComponent }  from './programs/program-detail.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/programs',
    pathMatch: 'full'
  },
  {
    path: 'programs',
    component: ProgramsComponent
  },
  {
    path: 'programs/:id',
    component: ProgramDetailComponent
  },
  {
    path: 'programs/new',
    component: ProgramDetailComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);