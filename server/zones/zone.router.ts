import express = require("express");
import ZoneModel = require("./zone.model");

function getZones(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  ZoneModel
    .getZones()
    .then(zones => {
      res.send(JSON.stringify(zones));
    })
    .catch(error => {
      console.log('failed to get zones: ' + JSON.stringify(error));
      res.status(500).send(JSON.stringify(error));
    });
}

function getZone(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  ZoneModel
    .getZone(parseInt(req.params.zoneId))
    .then(zone => {
      res.send(JSON.stringify(zone));
    })
    .catch(error => {
      if (error instanceof ZoneModel.NotFoundError)
        return res.status(404).send(JSON.stringify({ detail: 'Not Found' }));
      console.log('failed to get zone: ' + JSON.stringify(error));
      res.status(500).send(JSON.stringify(error));
    });
}

function updateZone(req: express.Request, res: express.Response) {
  
  let zone = req.body as ZoneModel.Zone;
  if (!zone) {
    return res.status(400).send({ error: 'Failed to parse request body' });
  }
  zone.zoneId = parseInt(req.params.zoneId);

  ZoneModel
    .update(zone)
    .then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(zone.zoneId));
    })
    .catch(error => {
      if (error instanceof ZoneModel.NotFoundError)
        return res.status(404).send(JSON.stringify({ detail: 'Not Found' }));
      console.log('failed to update zone: ' + JSON.stringify(error));
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify(error));
    });
}

let zonesRouter = express.Router();

zonesRouter.get('', getZones);
zonesRouter.get('/:zoneId', getZone);
zonesRouter.post('/:zoneId', updateZone);

export = zonesRouter;