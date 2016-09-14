import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { ProgramService } from './program.service';
import { Program } from './program';

@Component({
  selector: 'my-program-detail',
  templateUrl: 'app/programs/program-detail.component.html'
})
export class ProgramDetailComponent implements OnInit {
  
  program: Program;
  
  constructor(
    private programService: ProgramService,
    private route: ActivatedRoute) {
  }
  
  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      let id = +params['id'];
      this.programService.getProgram(id)
        .then(program => this.program = program);
    });
  }
}