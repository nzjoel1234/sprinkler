import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-schedule-time',
  templateUrl: './schedule-time.component.html',
  styleUrls: ['./schedule-time.component.css']
})
export class ScheduleTimeComponent implements OnChanges {
  @Input() hours: number;
  @Input() minutes: number;
  @Output() timeChanged = new EventEmitter<{hours: number, minutes: number}>();

  time: Date;

  constructor() {
  }

  ngOnChanges() {
    console.log('changes');
    console.log({ hours: this.hours, minutes: this.minutes });
    this.time = new Date();
    this.time.setHours(this.hours || 0);
    this.time.setMinutes(this.minutes || 0);
  }

  onTimeChanged(): void {
    console.log('emitting');
    this.timeChanged.emit({
      hours: this.time.getHours(),
      minutes: this.time.getMinutes()
    });
  }
}
