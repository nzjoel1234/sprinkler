import { Injectable } from '@angular/core';

import { Zone } from './zone';

const ZONES: Zone[] = [
  {
    zoneId: 1,
    name: 'Road',
    pin: 0
  },
  {
    zoneId: 2,
    name: 'Driveway',
    pin: 1
  },
  {
    zoneId: 3,
    name: 'Fence',
    pin: 2
  }
];

@Injectable()
export class ZoneService {
  
  getZones(): Promise<Zone[]> {
    return Promise.resolve(ZONES);
  }
  
  getZone(id: number): Promise<Zone> {
    return this
      .getZones()
      .then(zones => zones.find(zone => zone.zoneId === id));
  }
}