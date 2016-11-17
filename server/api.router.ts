import express = require("express");
import bodyParser = require('body-parser');
import passport = require('passport');
import passportHttp = require('passport-http');

import UserModel = require("./users/user.model");

passport.use(new passportHttp.BasicStrategy(
  function (username, password, done) {
    UserModel
      .verifyUser(username, password)
      .then(user => done(null, user))
      .catch(error => {
        if (error instanceof UserModel.InvalidUserError ||
            error instanceof UserModel.UserLockedOutError)
          done(null, false);
        done(error);
      })
  })
);

let apiRouter = express.Router();
apiRouter.use(bodyParser.json());

apiRouter.use('/login', require("./users/login.router"));

apiRouter.use(passport.authenticate('basic', { session: false }))
apiRouter.use('/users', require("./users/users.router"));
apiRouter.use('/zones', require("./zones/zones.router"));
apiRouter.use('/programs', require("./programs/programs.router"));

export = apiRouter;