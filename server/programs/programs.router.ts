import express = require("express");
import ProgramModel = require("./program.model");

function getPrograms(req: express.Request, res: express.Response) {
  let program1 = new ProgramModel.Program()
  program1.programId = 1;
  program1.name = 'Program One';

  let program2 = new ProgramModel.Program()
  program2.programId = 2;
  program2.name = 'Program Two';

  let program3 = new ProgramModel.Program()
  program3.programId = 3;
  program3.name = 'Program Three';
  
  res.send([ program1, program2, program3 ]);
}

function getProgram(req: express.Request, res: express.Response) {

  let program = new ProgramModel.Program()

  program.programId = req.params.programId;
  program.name = 'Program ' + req.params.programId;

  res.send(program);
}

function updateProgram(req: express.Request, res: express.Response) {
  let program = new ProgramModel.Program()

  program.programId = req.params.programId;
  program.name = 'Program ' + req.params.programId;

  res.send(program);
}

let programsRouter = express.Router();

programsRouter.get('', getPrograms);
programsRouter.get('/:programId', getProgram);
programsRouter.post('/:programId', updateProgram);

export = programsRouter;