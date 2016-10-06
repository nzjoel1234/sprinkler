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
app.use('/systemjs.config.js', express.static(path.resolve(__dirname, 'systemjs.config.js')));
app.use('/styles.css', express.static(path.resolve(__dirname, 'styles.css')));
 
app.get('/*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(4000, () => {
  console.log('Listening from ' + __dirname);
})