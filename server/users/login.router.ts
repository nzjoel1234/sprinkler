import express = require("express");
import UserModel = require("./user.model");

function login(req: express.Request, res: express.Response) {

  res.setHeader('Content-Type', 'application/json');

  let username = req.body.username;
  let password = req.body.password;

  UserModel
    .verifyUser(username, password)
    .then(() => res.status(200).send())
    .catch(error => {
      if (error instanceof UserModel.UserLockedOutError)
        return res.status(403).send(JSON.stringify({
          error: "Too many failed attempts. User is locked out."
        }))
      if (error instanceof UserModel.InvalidUserError)
        return res.status(403).send(JSON.stringify({
          error: "Invalid username or password."
        }))
      return res.status(500).send(JSON.stringify(error));
    });
}

let loginRouter = express.Router();

loginRouter.post('', login);

export = loginRouter;