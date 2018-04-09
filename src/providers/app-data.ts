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
  selectStatusQuery = "SELECT * FROM status ORDER BY created_dt";

  constructor(private platform: Platform, private sqlite: SQLite) {

  }

  insertStatuses(db: SQLiteObject): Promise<void> {
    this.db = db;
    console.log("insert statuses");
    return db.executeSql('SELECT * FROM status', {}).then(res => {
      if(res.rows.length < 1)
      {
        let query = "INSERT INTO status (title, abbreviation, color, created_dt) VALUES"
                                      + "('To Do', 'To Do'," + "'#0644EE', '" + new Date() + "'),"
                                      + "('In Process', 'In Pro', " + "'#460285', '" + new Date() + "'),"
                                      + "('Review', 'Rev', " + "'#FF7400', '" + new Date() + "'),"
                                      + "('Final Review', 'F Rev', " + "'#1CA49A', '" + new Date() + "'),"
                                      + "('Done', 'Done', " + "'#00F240', '" + new Date() + "')";
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
  getMaxorderNo(status, parent): Promise<number | void>{
    let me = this;
    return me.db.executeSql('SELECT MAX(order_no) as maxorderno FROM request WHERE request.status = ? AND request.parent_id = ?', [status, parent])
      .then(res => {
        let maxOrderNo = res.rows.item(0).maxorderno;
        let neworderNo = 0;
        if(maxOrderNo == null)
          neworderNo = 0;
        else
          neworderNo = maxOrderNo + 1

        return neworderNo;
      })
      .catch(e => alert(e));
  }

  updateOrderNumbersUnder(status, parent, oldOrderNo): Promise<void> {
    let me = this;
    console.log("status is " + status + " parent " + parent + " oldorder_no " + oldOrderNo);
    return me.db.executeSql('SELECT * FROM request WHERE request.status = ? AND request.parent_id = ? AND request.order_no > ?', [status, parent, oldOrderNo])
    .then(res => {
      console.log("got all the order numbers that need updated");
      let ids = [];
      for(var i = 0; i < res.rows.length; i++)
      {
        let item = res.rows.item(i);
        console.log("before changing order no item title " + item.title + " item order number " + item.order_no);
        ids.push(item.id);
      }
      if(ids.length > 0)
      {
        console.log('row ids that need updated are ' + ids);
        let str = '?,'.repeat(ids.length - 1);
        let query = "UPDATE request SET order_no = order_no - 1 WHERE id IN(" + str + '?)';

        return me.db.executeSql(query, ids);
      }
      else
        return;
    });
  }
}
