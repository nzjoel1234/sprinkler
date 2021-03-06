import { Component, OnInit } from '@angular/core';

import { ProgramSummary } from './program';
import { ProgramService } from './program.service';

@Component({
  selector: 'my-programs',
  templateUrl: './programs.component.html'
})
export class ProgramsComponent implements OnInit {

  programs: ProgramSummary[];

  constructor(
    private programService: ProgramService) { }

  getPrograms(): void {
    this.programService.getPrograms().then(programs => this.programs = programs);
  }

  ngOnInit(): void {
    this.getPrograms();
  }

  deleteProgram(program: ProgramSummary): void {
    if (!confirm(`Are you sure you want to delete program '${program.name}'`)) { return; }
    this.programs = this.programs.filter(p => p.programId !== program.programId);
    this.programService.deleteProgram(program.programId)
      .then(() => this.getPrograms())
      .catch(() => alert('Failed to delete program'));
  }

  startProgram(program: ProgramSummary): void {
    this.programService.startProgram(program.programId)
      .catch(() => alert('Failed to start program'));
  }
}
