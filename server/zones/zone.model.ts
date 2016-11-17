import dataAccess = require("../data-access");

export class Zone {
  zoneId: number;
  name: string;
}

export class NotFoundError extends Error { }

export function getZones(): Promise<Zone[]> {
  return dataAccess.invoke(db =>
    db.all(`
      SELECT
        ZoneId as zoneId,
        Name as name
      FROM Zone
    `)
    .then(zones => {
      if (!zones) zones = [];
      return zones.map(zone => zone as Zone);
    })
  );
}

export function getZone(zoneId: number): Promise<Zone> {
  return dataAccess.invoke(db =>
    db.get(`
      SELECT
        ZoneId as zoneId,
        Name as name
      FROM Zone
      WHERE ZoneId = $zoneId`,
      { $zoneId: zoneId })
    .then(zone => {
      if (!zone) throw new NotFoundError();
      return zone as Zone;
    })
  );
}

export function update(zone: Zone): Promise<any> {

  console.log(zone);

  return dataAccess.invoke(db =>
    db.run(`
      UPDATE Zone
      SET Name = $name
      WHERE ZoneId = $zoneId
    `, { $name: zone.name, $zoneId: zone.zoneId })
    .then(() => db.get('select changes() as changes'))
    .then(row => {
      if (!row.changes) throw new NotFoundError();
    })
    .then(() => zone)
  );
}
