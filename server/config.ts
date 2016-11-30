import fs = require('fs');

let config = {
  databaseScriptPath: 'PATH TO DATABASE FOLDER'
};

try {
    var userConfig = require('./config.mine');
    if (userConfig) {
      Object.assign(config, userConfig);
    }
} catch (ex) { }

export = config;