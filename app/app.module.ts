import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { Ng2BootstrapModule }     from 'ng2-bootstrap/ng2-bootstrap';

import { AppComponent }           from './app.component';
import { routing }                from './app.routing';

import { ProgramsComponent }      from './programs/programs.component';
import { ProgramDetailComponent } from './programs/program-detail.component';
import { ProgramService }         from './programs/program.service';

import { ZoneService }            from './zones/zone.service';

@NgModule({
  imports: [
    BrowserModule,
    Ng2BootstrapModule,
    FormsModule,
    routing
  ],
  declarations: [
    AppComponent,
    ProgramsComponent,
    ProgramDetailComponent
  ],
  providers: [
    ProgramService,
    ZoneService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}