import express = require("express");
import bodyParser = require('body-parser')

let apiRouter = express.Router();

apiRouter.use(bodyParser.json());

apiRouter.use('/zones', require("./zones/zone.router"));
apiRouter.use('/programs', require("./programs/programs.router"));

export = apiRouter;