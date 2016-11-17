import express = require("express");
import UserModel = require("./user.model");

function createUser(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');
  res.status(500).send('Not implemented');

}

let usersRouter = express.Router();

usersRouter.post('', createUser);

export = usersRouter;