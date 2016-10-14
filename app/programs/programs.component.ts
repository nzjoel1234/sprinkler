import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { ProgramSummary }        from './program';
import { ProgramService } from './program.service';

@Component({
  selector: 'my-programs',
  templateUrl: 'app/programs/programs.component.html'
})
export class ProgramsComponent implements OnInit {
  programs: ProgramSummary[];
  selectedProgram: ProgramSummary;

  constructor(
    private router: Router,
    private programService: ProgramService) { }

  getPrograms(): void {
    this.programService.getPrograms().then(programs => this.programs = programs);
  }

  ngOnInit(): void {
    this.getPrograms();
  }

  goToDetail(program: ProgramSummary): void {
    this.router.navigate(['sprinkler', 'programs', program.programId]);
  }

  goToNew(): void {
    this.router.navigate(['sprinkler', 'programs', 'new']);
  }

  deleteProgram(program: ProgramSummary): void {
    this.programService.deleteProgram(program.programId)
      .then(() => this.getPrograms())
      .catch(() => alert('failed to delete program'));
  }
}