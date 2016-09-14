import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { ProgramService } from './program.service';
import { Program, ProgramScheduleType } from './program';

@Component({
  selector: 'my-program-detail',
  templateUrl: 'app/programs/program-detail.component.html'
})
export class ProgramDetailComponent implements OnInit {
  
  program: Program;
  startTime: Date;
  programScheduleTypes = [
    { display: 'Manual Only', value: ProgramScheduleType.ManualOnly },
    { display: 'All Days', value: ProgramScheduleType.AllDays },
    { display: 'Days Of Week', value: ProgramScheduleType.DaysOfWeek },
    { display: 'Odd Days', value: ProgramScheduleType.OddDays },
    { display: 'Even Days', value: ProgramScheduleType.EvenDays }
  ];
  
  constructor(
    private programService: ProgramService,
    private route: ActivatedRoute) {
  }
  
  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      let id = +params['id'];
      this.programService
        .getProgram(id)
        .then(program => {
          this.program = program;
          this.startTime = new Date();
          this.startTime.setHours(program.startTimeHours);
          this.startTime.setMinutes(program.startTimeMinutes);
        });
    });
  }
  
  showDaySelection(): boolean {
    return this.program.programScheduleType == ProgramScheduleType.DaysOfWeek
  }
  
  startTimeChanged(): void {
    console.log('changed');
    this.program.startTimeHours = this.startTime.getHours();
    this.program.startTimeMinutes = this.startTime.getMinutes();
  }
}