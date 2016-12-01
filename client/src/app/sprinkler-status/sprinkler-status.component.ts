import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';

import { SprinklerStatus } from '../programs/program';
import { ProgramService } from '../programs/program.service';

@Component({
  selector: 'my-sprinkler-status',
  templateUrl: './sprinkler-status.component.html',
  styleUrls: ['./sprinkler-status.component.css']
})
export class SprinklerStatusComponent implements OnInit, OnDestroy {

  statusText$: ReplaySubject<string> = new ReplaySubject<string>(1);
  currentlyActive$: ReplaySubject<Boolean> = new ReplaySubject<Boolean>(1);
  subscription: Subscription;

  constructor(
    private programService: ProgramService) {
      this.statusText$.next('Loading status...');
      this.currentlyActive$.next(false);
  }

  ngOnInit(): void {
    this.updateStatus();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  secondsToDisplayTime(seconds: number) {
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    let paddedMinutes =  `00${minutes}`.slice(-2);
    return `${hours}h ${paddedMinutes}m`;
  }

  isStatusActive(status: SprinklerStatus): boolean {
    return !!status && (status.programStartIn <= 0);
  }

  getStatusText(status: SprinklerStatus): string {
    if (!status) {
      return 'No scheduled programs';
    }

    return status.programStartIn > 0
        ? `Program '${status.programName}' - Starts in ${this.secondsToDisplayTime(status.programStartIn)}`
        : `Running program '${status.programName}' - ${this.secondsToDisplayTime(status.programEndIn)} remaining`;
  }

  updateStatus(): Promise<any> {
    const refreshIntervalMs = 5000;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.programService
      .sprinklerStatus$
      .timeout(refreshIntervalMs)
      .subscribe(status => {
        this.currentlyActive$.next(this.isStatusActive(status));
        this.statusText$.next(this.getStatusText(status));
      }, error => this.updateStatus());

    return this.programService
      .updateSprinklerStatus();
  }

  stopAllPrograms(): void {
    this.programService.stopAll();
  }
}
