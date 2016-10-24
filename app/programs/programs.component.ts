import { Component, OnInit } from '@angular/core';

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
    private programService: ProgramService) { }

  getPrograms(): void {
    this.programService.getPrograms().then(programs => this.programs = programs);
  }

  ngOnInit(): void {
    this.getPrograms();
  }

  deleteProgram(program: ProgramSummary): void {
    this.programService.deleteProgram(program.programId)
      .then(() => this.getPrograms())
      .catch(() => alert('Failed to delete program'));
  }

  startProgram(program: ProgramSummary): void {
    this.programService.startProgram(program.programId)
      .then(() => alert(`Started program '${program.name}'`))
      .catch(() => alert('Failed to start program'));
  }
}