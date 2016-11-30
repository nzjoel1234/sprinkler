import fs = require('fs');

let config = {
  databaseScriptPath: '/database'
};

try {
    var userConfig = require('./config.mine');
    if (userConfig) {
      Object.assign(config, userConfig);
    }
} catch (ex) { }

export = config;