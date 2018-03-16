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
        let query = "INSERT INTO status (title, abbreviation, color, createddt) VALUES"
                                      + "('To Do', 'To Do'," + "'#e13838', '" + new Date() + "'),"
                                      + "('In Process', 'In Pro', " + "'#d21e82', '" + new Date() + "'),"
                                      + "('Review', 'Rev', " + "'#d2821e', '" + new Date() + "'),"
                                      + "('Final Review', 'F Rev', " + "'#1ed24d', '" + new Date() + "'),"
                                      + "('Done', 'Done', " + "'#1e98d2', '" + new Date() + "')";
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
  getMaxOrderNo(status, parent): Promise<number | void>{
    let me = this;
    return me.db.executeSql('SELECT MAX(orderno) as maxorderno FROM request WHERE request.status = ? AND request.parentid = ?', [status, parent])
      .then(res => {
        let maxOrderNo = res.rows.item(0).maxorderno;
        let newOrderNo = 0;
        if(maxOrderNo == null)
          newOrderNo = 0;
        else
          newOrderNo = maxOrderNo + 1

        return newOrderNo;
      })
      .catch(e => alert(e));
  }

  updateOrderNumbersUnder(status, parent, oldOrderNo): Promise<void> {
    let me = this;
    return me.db.executeSql('SELECT * FROM request WHERE request.status = ? AND request.parentid = ? AND request.orderno > ?', [status, parent, oldOrderNo])
    .then(res => {
      console.log("got all the order numbers that need updated");
      let rowids = [];
      for(var i = 0; i < res.rows.length; i++)
      {
        let item = res.rows.item(i);
        rowids.push(item.rowid);
      }
      console.log('row ids that need updated are ' + rowids);
      return me.db.executeSql("UPDATE request SET orderno = orderno - 1 WHERE rowid IN (?)", [rowids])
      .then(res => {
        console.log("udpated the order numbers rowids are " + rowids);
      });
    });
  }
}
