import { NgModule }                from '@angular/core';
import { BrowserModule }           from '@angular/platform-browser';
import { FormsModule }             from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { Ng2BootstrapModule }     from 'ng2-bootstrap/ng2-bootstrap';

import { AppComponent }           from './app.component';
import { routing }                from './app.routing';

import { AuthenticatedHttp }       from './authentication/authenticated-http.service';
import { AuthenticationService }   from './authentication/authentication.service';
import { LoggedInGuard }           from './authentication/logged-in.guard';
import { LoginComponent }          from './authentication/login.component';

import { SprinklerComponent }      from './sprinkler.component'

import { ProgramsComponent }      from './programs/programs.component';
import { ProgramDetailComponent } from './programs/program-detail.component';
import { SprinklerStatusComponent } from './sprinkler-status/sprinkler-status.component';

import { ProgramService }         from './programs/program.service';
import { ZonesService }            from './zones/zones.service';
import { ScheduleTimeComponent } from './programs/schedule-time/schedule-time.component';

@NgModule({
  imports: [
    BrowserModule,
    Ng2BootstrapModule,
    FormsModule,
    routing,
    HttpModule,
    JsonpModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    SprinklerComponent,
    ProgramsComponent,
    ProgramDetailComponent,
    SprinklerStatusComponent,
    ScheduleTimeComponent
  ],
  providers: [
    ProgramService,
    ZonesService,
    AuthenticatedHttp,
    AuthenticationService,
    LoggedInGuard
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
