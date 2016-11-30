import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { ProgramService } from './program.service';
import { Program, ProgramSchedule, ProgramStage, ProgramScheduleType } from './program';

import { ZonesService } from './../zones/zones.service';
import { Zone } from './../zones/zone';

@Component({
  selector: 'my-program-detail',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.css']
})
export class ProgramDetailComponent implements OnInit {

  program: Program;
  orderedStages: ProgramStage[];
  schedules: ProgramSchedule[];

  isSaving: boolean = false;

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
            newProgram.name = 'New Program';
            this.program = newProgram;
          }
        })
        .then(() => {
          this.schedules = this.program.schedules;
        })
        .then(() => {
          this.orderedStages = this.program.stages
            .sort((a, b) => a.orderId - b.orderId);
        });
    });
  }

  scheduleStartTimeChanged(schedule: ProgramSchedule, $event: { hours: number, minutes: number }) {
    schedule.startTimeHours = $event.hours;
    schedule.startTimeMinutes = $event.minutes;
  }

  getRunningTime(): number {
    return this.program.stages
      .map(stage => stage.minutes)
      .reduce((prev, curr) => prev + curr, 0);
  }

  addStage(): void {
    if (!!this.zones && this.zones.length === 0) {
      return;
    }

    let existingItemCount = this.program.stages.length;
    let previousItem = this.program.stages[existingItemCount - 1];

    let newItem = new ProgramStage();
    newItem.minutes = previousItem == null ? 20 : previousItem.minutes;

    let zoneId = 0;
    for (let zoneIndex = 0; zoneIndex < this.zones.length; zoneIndex++) {
      zoneId = this.zones[zoneIndex].zoneId;
      let stagesInZone = this.program.stages
            .filter(v => v.zoneId === zoneId);
      if (stagesInZone.length === 0) {
        break;
      }
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
    this.schedules.push(newSchedule);
  }

  removeSchedule(item: ProgramSchedule): void {
    let index = this.schedules.indexOf(item);
    this.schedules.splice(index, 1);
  }

  save(): void {
    this.isSaving = true;
    this.program.schedules = this.schedules;
    this.program.stages = this.orderedStages.map((stage, index) => {
      stage.orderId = index;
      return stage;
    });
    this.programService
      .saveProgram(this.program)
      .then(() => this.router.navigate(['sprinkler', 'programs']))
      .catch(error => {
        this.isSaving = false;
        alert('failed to save: ' + error.statusText);
      });
  }
}
