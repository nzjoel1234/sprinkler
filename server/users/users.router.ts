import express = require("express");
import UserModel = require("./user.model");

function createUser(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  let { username, password } = req.body;

  UserModel
    .createUser(username, password)
    .then(() => res.status(204).send())
    .catch(error => {
      if (error.errno == 19)
        return res.status(409).send(JSON.stringify({
          error: "Username already exists"
        }))
      console.log('failed to create user: ' + JSON.stringify(error));
      return res.status(500).send(JSON.stringify(error));
    });
}

function changePassword(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  let { newPassword } = req.body;

  UserModel
    .changePassword(req.user.username, newPassword)
    .then(() => res.status(204).send())
    .catch(error => {
      console.log('failed to change password: ' + JSON.stringify(error));
      return res.status(500).send(JSON.stringify(error));
    });
}

let usersRouter = express.Router();

usersRouter.post('', createUser);
usersRouter.post('/change-password', changePassword);

export = usersRouter;