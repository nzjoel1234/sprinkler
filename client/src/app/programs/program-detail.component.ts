import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { ProgramService } from './program.service';
import { Program, ProgramSchedule, ProgramStage, ProgramScheduleType } from './program';

import { ZonesService } from './../zones/zones.service';
import { Zone } from './../zones/zone';

class ProgramScheduleViewModel {

  startTime: Date;

  public constructor(
    public model: ProgramSchedule) {

    this.startTime = new Date();
    this.startTime.setHours(model.startTimeHours);
    this.startTime.setMinutes(model.startTimeMinutes);
  }

  startTimeChanged(): void {
    this.model.startTimeHours = this.startTime.getHours();
    this.model.startTimeMinutes = this.startTime.getMinutes();
  }
}

@Component({
  selector: 'my-program-detail',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.css']
})
export class ProgramDetailComponent implements OnInit {
  
  program: Program;
  orderedStages: ProgramStage[];
  schedules: ProgramScheduleViewModel[];
  
  zones: Zone[];
  
  programScheduleTypes = [
    { display: 'All Days', value: ProgramScheduleType.AllDays },
    { display: 'Odd Days', value: ProgramScheduleType.OddDays },
    { display: 'Even Days', value: ProgramScheduleType.EvenDays }
  ];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private programService: ProgramService,
    private zoneService: ZonesService) {
  }
  
  ngOnInit(): void {
    
    this.route.params.forEach((params: Params) => {

      let programId = Number.parseInt(params['id']);

      this.zoneService.getZones()
        .then(zones => this.zones = zones)
        .then(() => {
          if (programId) {
            return this.programService
              .getProgram(programId)
              .then(program => {
                this.program = program;
              });
          } else {
            let newProgram = new Program();
            newProgram.programId = 0;
            newProgram.name = "New Program";
            this.program = newProgram;
          }
        })
        .then(() => {
          this.schedules = this.program.schedules
            .map(schedule => new ProgramScheduleViewModel(schedule));
        })
        .then(() => {
          this.orderedStages = this.program.stages
            .sort((a, b) => a.orderId - b.orderId);
        });
    });
  }

  getRunningTime(): number {
    return this.program.stages
      .map(stage => stage.minutes)
      .reduce((prev, curr) => prev + curr, 0);
  }
  
  addStage(): void {
    if (!!this.zones && this.zones.length == 0) return;

    let existingItemCount = this.program.stages.length;
    let previousItem = this.program.stages[existingItemCount - 1];

    let newItem = new ProgramStage();
    newItem.minutes = previousItem == null ? 20 : previousItem.minutes;

    let zoneId = 0;
    for (let zoneIndex = 0; zoneIndex < this.zones.length; zoneIndex++) {
      zoneId = this.zones[zoneIndex].zoneId;
      if (this.program.stages
            .filter(v => v.zoneId == zoneId)
            .length == 0)
        break;
    }
    newItem.zoneId = zoneId;
    this.program.stages.push(newItem);
  }
  
  removeStage(item: ProgramStage): void {
    let index = this.program.stages.indexOf(item);
    this.program.stages.splice(index, 1);
  }
  
  addSchedule(): void {
    let newSchedule = new ProgramSchedule();
    newSchedule.scheduleType = ProgramScheduleType.AllDays;
    newSchedule.startTimeHours = 0;
    newSchedule.startTimeMinutes = 0;
    let newItem = new ProgramScheduleViewModel(newSchedule);
    this.schedules.push(newItem);
  }
  
  removeSchedule(item: ProgramScheduleViewModel): void {
    let index = this.schedules.indexOf(item);
    this.schedules.splice(index, 1);
  }

  save(): void {
    this.program.schedules = this.schedules.map(s => s.model);
    this.program.stages = this.orderedStages.map((stage, index) => {
      stage.orderId = index;
      return stage;
    })
    this.programService
      .saveProgram(this.program)
      .then(() => this.router.navigate(['sprinkler', 'programs']))
      .catch(error => alert('failed to save'));
  }
}
