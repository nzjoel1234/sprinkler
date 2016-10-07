import express = require("express");

import programsRouter = require("./programs/programs.router");

let apiRouter = express.Router();

apiRouter.use('/programs', programsRouter);

export = apiRouter;