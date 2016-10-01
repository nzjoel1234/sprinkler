import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { ProgramService } from './program.service';
import { Program, ProgramScheduleItem, ProgramScheduleType } from './program';

import { ZoneService } from './../zones/zone.service';
import { Zone } from './../zones/zone';

@Component({
  selector: 'my-program-detail',
  templateUrl: 'app/programs/program-detail.component.html'
})
export class ProgramDetailComponent implements OnInit {
  
  program: Program;
  startTime: Date;
  
  zones: Zone[];
  
  programScheduleTypes = [
    { display: 'Manual Only', value: ProgramScheduleType.ManualOnly },
    { display: 'All Days', value: ProgramScheduleType.AllDays },
    { display: 'Days Of Week', value: ProgramScheduleType.DaysOfWeek },
    { display: 'Odd Days', value: ProgramScheduleType.OddDays },
    { display: 'Even Days', value: ProgramScheduleType.EvenDays }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private programService: ProgramService,
    private zoneService: ZoneService) {
  }
  
  ngOnInit(): void {
    
    this.route.params.forEach((params: Params) => {

      let id = Number.parseInt(params['id']);

      if (id) {
        this.programService
          .getProgram(id)
          .then(program => {
            this.program = program;
            this.startTime = new Date();
            this.startTime.setHours(program.startTimeHours);
            this.startTime.setMinutes(program.startTimeMinutes);
          });
      } else {
        this.program = this.programService.getNewProgram();
      }
    });

    this.zoneService
      .getZones()
      .then(zones => this.zones = zones);
  }
  
  showDaySelection(): boolean {
    return this.program.programScheduleType == ProgramScheduleType.DaysOfWeek
  }
  
  showTimeSelection(): boolean {
    return this.program.programScheduleType != ProgramScheduleType.ManualOnly
  }
  
  startTimeChanged(): void {
    this.program.startTimeHours = this.startTime.getHours();
    this.program.startTimeMinutes = this.startTime.getMinutes();
  }
  
  addScheduleItem(): void {
    if (!!this.zones && this.zones.length == 0) return;

    let existingItemCount = this.program.scheduleItems.length;
    let previousItem = this.program.scheduleItems[existingItemCount - 1];

    let newItem = new ProgramScheduleItem();
    newItem.minutes = previousItem == null ? 20 : previousItem.minutes;

    let zoneId = 0;
    for (let zoneIndex = 0; zoneIndex < this.zones.length; zoneIndex++) {
      zoneId = this.zones[zoneIndex].zoneId;
      if (this.program.scheduleItems
            .filter(v => v.zoneId == zoneId)
            .length == 0)
        break;
    }
    newItem.zoneId = zoneId;
    this.program.scheduleItems.push(newItem);
  }
  
  removeScheduleItem(item: ProgramScheduleItem): void {
    let index = this.program.scheduleItems.indexOf(item);
    this.program.scheduleItems.splice(index, 1);
  }
}