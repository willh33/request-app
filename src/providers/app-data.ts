/**
 * Created by Julie on 8/5/2016.
 */
import {Injectable} from '@angular/core';

import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class AppData {

  public statuses = [];
  public db: SQLiteObject;
  selectStatusQuery = "SELECT * FROM status ORDER BY createddt";

  constructor(private platform: Platform, private sqlite: SQLite) {

  }

  insertStatuses(db: SQLiteObject): Promise<void> {
    this.db = db;
    console.log("insert statuses");
    return db.executeSql('SELECT * FROM status', {}).then(res => {
      if(res.rows.length < 1)
      {
        let query = "INSERT INTO status (title, color, createddt) VALUES"
                                      + "('To Do', " + "'#e13838', '" + new Date() + "'),"
                                      + "('In Process', " + "'#d21e82', '" + new Date() + "'),"
                                      + "('Review', " + "'#d2821e', '" + new Date() + "'),"
                                      + "('Final Review', " + "'#1ed24d', '" + new Date() + "'),"
                                      + "('Done', " + "'#1e98d2', '" + new Date() + "')";
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
    this.db = db;
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
