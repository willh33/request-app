/**
 * Created by Julie on 8/5/2016.
 */
import {Injectable} from '@angular/core';

import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class AppData {

  statuses = [];
  db: SQLiteObject;

  constructor(private platform: Platform, private sqlite: SQLite) {

  }

  createDatabaseAndTables(): Promise<void> {
    console.log("create dataases and tables");

    return this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;

      //create request table
      db.executeSql('CREATE TABLE IF NOT EXISTS request(rowid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status INTEGER, orderno, createddt TEXT, modifieddt TEXT)', {})
      .then(res => {
        db.executeSql('SELECT * FROM request', {})
        .then(res => {
          console.log("res rows length " + res.rows.length);
        });
      })
      .catch(e => alert(e));
      //Create status table and insert rows
      return db.executeSql('CREATE TABLE IF NOT EXISTS status(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, color TEXT, createddt TEXT, modifieddt TEXT)', {})
      .then(res => {
        return this.insertStatuses(db);
      })
      .catch(e => alert(e));
    })
  }
  insertStatuses(db: SQLiteObject): Promise<void> {
    console.log("insert statuses");
    return db.executeSql('SELECT * FROM status', {}).then(res => {
      if(res.rows.length < 1)
      {
        let query = "INSERT INTO status (title, color, createddt) VALUES"
                                      + "('To Do', " + "'#e13838', '" + new Date() + "'),"
                                      + "('In Process', " + "'#e13838', '" + new Date() + "'),"
                                      + "('Review', " + "'#e13838', '" + new Date() + "'),"
                                      + "('Final Review', " + "'#e13838', '" + new Date() + "'),"
                                      + "('Done', " + "'#e13838', '" + new Date() + "')";
        console.log("query is " + query);
        return db.executeSql(query, [])
        .then(res => {
          return this.getAndSetStatuses(db);
        })
        .catch(e => alert(e));
      }
      else
        return this.getAndSetStatuses(db);
    }).catch(e => alert(e));
  }
  getAndSetStatuses(db): Promise<void> {
    return db.executeSql('SELECT * FROM status', {}).then(res => {
      for(var i = 0; i<res.rows.length; i++){
        let status = res.rows.item(i);
        let statusTitle = status.title;
        console.log("status title " + statusTitle);
        this.statuses.push(status);
      }
    }).catch(e => alert(e));
  }
}
