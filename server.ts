import express = require('express');
import path = require('path');

import apiRouter = require('./server/api.router');

var app = express();

var logger = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(req.method + ':' + req.url);
    next();
}

app.use(logger);

app.use('/api', apiRouter);

app.use('/app', express.static(path.resolve(__dirname, 'app')));
app.use('/lib', express.static(path.resolve(__dirname, 'lib')));
app.use('/styles.css', express.static(path.resolve(__dirname, 'styles.css')));
app.use('/favicon.ico', express.static(path.resolve(__dirname, 'favicon.ico')));
 
app.get('/*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

let PORT = 4000;
app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
})
