import express = require("express");
import bodyParser = require('body-parser');

import UserModel = require("./users/user.model");

let apiRouter = express.Router();
apiRouter.use(bodyParser.json());

apiRouter.use('/login', require("./users/login.router"));
apiRouter.use('/users', require("./users/users.router"));
apiRouter.use('/zones', require("./zones/zones.router"));
apiRouter.use('/programs', require("./programs/programs.router"));

export = apiRouter;