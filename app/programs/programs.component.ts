import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Program }        from './program';
import { ProgramService } from './program.service';

@Component({
  selector: 'my-programs',
  templateUrl: 'app/programs/programs.component.html'
})
export class ProgramsComponent implements OnInit {
  programs: Program[];
  selectedProgram: Program;

  constructor(
    private router: Router,
    private programService: ProgramService) { }

  getPrograms(): void {
    this.programService.getPrograms().then(programs => this.programs = programs);
  }

  ngOnInit(): void {
    this.getPrograms();
  }

  goToDetail(program: Program): void {
    this.router.navigate(['programs', program.id]);
  }

  goToNew(): void {
    this.router.navigate(['programs', 'new']);
  }
}