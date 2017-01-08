import sqlite3 = require('sqlite3');
import fs = require('fs');
let ReadWriteLock = require('rwlock');

import config = require('./config');

const scriptsDir = config.databaseScriptPath;
const dbPath = scriptsDir + 'db.sqlite3';

var lock = new ReadWriteLock();
var instance: sqlite3.Database;

function getDbInstance(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    if (instance) {
      return resolve(instance);
    }
    instance = new sqlite3.Database(dbPath, error => {
      if (error) {
        console.log('Failed to connect to db: ' + JSON.stringify(error));
        return reject(error);
      }
      return resolve(instance);
    });
  })
    .then(() => upgradeIfRequired(instance))
    .then(() => instance);
}

let upgraded = false;

function upgradeIfRequired(db: sqlite3.Database): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get('PRAGMA user_version;', (err, row) =>
    {
      if (err) return reject(err);
      
      if (upgraded)
        return resolve();

      return Promise.resolve()
        .then(() => executeUpgradeScriptIfRequired(db, row.user_version as number, 1, 'create.sql'))
        .then(() => executeUpgradeScriptIfRequired(db, row.user_version as number, 2, 'version_2.sql'))
        .then(() => executeUpgradeScriptIfRequired(db, row.user_version as number, 3, 'version_3.sql'))
        .then(() => executeUpgradeScriptIfRequired(db, row.user_version as number, 4, 'version_4.sql'))
        .then(() => executeUpgradeScriptIfRequired(db, row.user_version as number, 5, 'version_5.sql'))
        .then(() => upgraded = true)
        .then(resolve)
        .catch(reject);
    });
  });
}

function executeUpgradeScriptIfRequired(db: sqlite3.Database, currentVersion: number, destinationVersion: number, scriptPath: string): Promise<any> {
  if (currentVersion >= destinationVersion)
    return Promise.resolve();

  console.log(`Upgrading DB from ${currentVersion} to ${destinationVersion}`);

  let scriptContent = fs.readFileSync(scriptsDir + scriptPath).toString();

  return new Promise((resolve, reject) => 
    db.exec(scriptContent.toString(), error => {
      if (error) return reject(error);
      return resolve();
    }));
}

export function invoke<T>(callback: (connection: SqliteConnection) => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    lock.writeLock(function (release:(() => null)) {
      getDbInstance()
        .then(db => new SqliteConnection(db))
        .then(connection => callback(connection))
        .then(result => resolve(result))
        .then(() => release())
        .catch(error => {
          release();
          reject(error);
        })
    });
  });
}

export class SqliteConnection {

  public constructor(
    private db: sqlite3.Database)
  { }

  public run(sql: string, parameters?: any): Promise<SqliteConnection> {
    return new Promise<SqliteConnection>((resolve, reject) => {
      this.db.run(sql, parameters, (error) => {
        if (error) return reject(error);
        resolve(this);
      });
    });
  }

  public get(sql: string, parameters?: any): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.db.get(sql, parameters, (error, row) => {
        if (error) return reject(error);
        return resolve(row);
      });
    }));
  }

  public all(sql: string, parameters?: any): Promise<any[]> {
    return new Promise<any>(((resolve, reject) => {
      this.db.all(sql, parameters, (error, rows) => {
        if (error) return reject(error);
        return resolve(rows);
      });
    }));
  }
}
