import sqlite3 = require('sqlite3');
import tp = require('typed-promisify');
import fs = require('fs');
import rxjs = require ('rxjs');

const schemaVersion = 1;

const scriptsDir = 'C:/work/personal/sprinkler/database/'
const dbPath = scriptsDir + 'db.sqlite3';

function getDbInstance(): Promise<sqlite3.Database> {
  let instance: sqlite3.Database;
  return new Promise((resolve, reject) => {
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
      
      executeUpgradeScriptIfRequired(db, 'create.sql', row.user_version as number, 1)
        .then(() => upgraded = true)
        .then(resolve)
        .catch(reject);
    });
  });
}

function executeUpgradeScriptIfRequired(db: sqlite3.Database, scriptPath: string, currentVersion: number, destinationVersion: number): Promise<any> {
  if (currentVersion >= destinationVersion)
    return Promise.resolve();

  console.log(`Upgrading DB from ${currentVersion} to ${destinationVersion}`);

  return tp.promisify(fs.readFile)(scriptsDir + scriptPath)
    .then(scriptContent => new Promise((resolve, reject) => {
      db.exec(scriptContent.toString(), error => {
        if (error) return reject(error);
        return resolve();
      });
    }));
}

export function invoke<T>(callback: (connection: SqliteConnection) => Promise<T>): Promise<T> {
  return getDbInstance()
    .then(db => {
      let result: Promise<any>;
      db.serialize(() =>
        result = callback(new SqliteConnection(db))
          .then(result => {
            db.close();
            return result;
          })
          .catch(error => {
            db.close();
            throw error;
      }));
      return result
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
