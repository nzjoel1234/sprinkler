import { NgModule }                from '@angular/core';
import { BrowserModule }           from '@angular/platform-browser';
import { FormsModule }             from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { Ng2BootstrapModule }     from 'ng2-bootstrap/ng2-bootstrap';

import { AppComponent }           from './app.component';
import { routing }                from './app.routing';

import { LoggedInGuard }           from './authentication/logged-in.guard';
import { AuthenticationService }   from './authentication/authentication.service';
import { LoginComponent }          from './authentication/login.component';

import { SprinklerComponent }      from './sprinkler.component'

import { ProgramsComponent }      from './programs/programs.component';
import { ProgramDetailComponent } from './programs/program-detail.component';
import { ProgramService }         from './programs/program.service';

import { ZonesService }            from './zones/zones.service';

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
    ProgramDetailComponent
  ],
  providers: [
    ProgramService,
    ZonesService,
    AuthenticationService,
    LoggedInGuard
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
