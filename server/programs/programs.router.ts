import express = require("express");
import ProgramModel = require("./program.model");

function getPrograms(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  ProgramModel
    .getPrograms()
    .then(programs => res.send(JSON.stringify(programs)))
    .catch(error => {
      console.log('failed to get programs: ' + JSON.stringify(error));
      return res.status(500).send(JSON.stringify(error));
    });
}

function getProgramDetail(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  ProgramModel
    .getProgramDetail(parseInt(req.params.programId))
    .then(program => res.send(JSON.stringify(program)))
    .catch(error => {
      if (error instanceof ProgramModel.NotFoundError)
        return res.status(404).send(JSON.stringify({ detail: 'Not Found' }));
      console.log('failed to get program: ' + JSON.stringify(error));
      return res.status(500).send(JSON.stringify(error));
    });
}

function deleteProgram(req: express.Request, res: express.Response) {
  
  res.setHeader('Content-Type', 'application/json');

  ProgramModel
    .deleteProgram(parseInt(req.params.programId))
    .then(() => res.status(204).send())
    .catch(error => {
      console.log('failed to delete program: ' + JSON.stringify(error));
      return res.status(500).send(JSON.stringify(error));
    });
}

function updateProgram(req: express.Request, res: express.Response) {
  
  res.setHeader('Content-Type', 'application/json');
  
  let program = req.body as ProgramModel.Program;
  if (!program) {
    return res.status(400).send({ error: 'Failed to parse request body' });
  }
  program.programId = parseInt(req.params.programId);

  ProgramModel
    .update(program)
    .then(() => res.status(204).send())
    .catch(error => {
      if (error instanceof ProgramModel.NotFoundError)
        return res.status(404).send(JSON.stringify({ detail: 'Not Found' }));
      console.log('failed to update program: ' + JSON.stringify(error));
      res.status(500).send(JSON.stringify(error));
    });
}

function createProgram(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  let program = req.body as ProgramModel.Program;
  if (!program) {
    return res.status(400).send({ error: 'Failed to parse request body' });
  }

  ProgramModel
    .create(program)
    .then(programId => res.status(201).send(JSON.stringify(programId)))
    .catch(error => {
      console.log('failed to create program: ' + JSON.stringify(error));
      res.status(500).send(JSON.stringify(error));
    });
}

function startProgram(req: express.Request, res: express.Response) {
  
  res.setHeader('Content-Type', 'application/json');
  
  let programId = parseInt(req.params.programId);

  ProgramModel
    .start(programId)
    .then(() => res.status(200).send())
    .catch(error => {
      if (error instanceof ProgramModel.NotFoundError)
        return res.status(404).send(JSON.stringify({ error: 'Not Found' }));
      console.log('failed to start program: ' + JSON.stringify(error));
      res.status(500).send(JSON.stringify(error));
    });
}

function stop(req: express.Request, res: express.Response) {
  
  res.setHeader('Content-Type', 'application/json');
  
  ProgramModel
    .stop()
    .then(() => res.status(200).send())
    .catch(error => {
      console.log('failed to stop programs: ' + JSON.stringify(error));
      res.status(500).send(JSON.stringify(error));
    });
}

function nextScheduledStage(req: express.Request, res: express.Response) {
  
  res.setHeader('Content-Type', 'application/json');
  
  ProgramModel
    .getNextScheduledStage()
    .then(stage => res.status(200).send(stage ? JSON.stringify(stage) : ""))
    .catch(error => {
      console.log('failed to get next scheduled stage: ' + JSON.stringify(error));
      res.status(500).send(JSON.stringify(error));
    });
}

let programsRouter = express.Router();

programsRouter.get('', getPrograms);
programsRouter.post('', createProgram);
programsRouter.get('/next-scheduled-stage', nextScheduledStage);
programsRouter.post('/stop', stop);
programsRouter.get('/:programId', getProgramDetail);
programsRouter.post('/:programId', updateProgram);
programsRouter.delete('/:programId', deleteProgram);
programsRouter.post('/:programId/start', startProgram);

export = programsRouter;