import express = require('express');
import path = require('path');

import apiRouter = require('./api.router');

var app = express();

var logger = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(req.method + ':' + req.url);
    next();
}

app.use(logger);

app.use('/api', apiRouter);
app.use('/.well-known', express.static('/var/www/letsencrypt/.well-known'));
app.use('/', express.static(path.resolve(__dirname, 'static')));
app.get('*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve(__dirname, 'static', 'index.html'));
});

let PORT = 4000;

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});
