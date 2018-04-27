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
    let me = this;
    me.db = db;
    console.log("insert statuses");
    return db.executeSql('SELECT * FROM status', {}).then(res => {
      if(res.rows.length < 1)
        return;
      else
        return me.getAndSetStatuses(db);
    }).catch(e => alert(e));
  }
  getAndSetStatuses(db): Promise<void> {
    let me = this;
    me.db = db;
    return db.executeSql('SELECT * FROM status', {}).then(res => {
      me.statuses = [];
      for(var i = 0; i<res.rows.length; i++){
        let status = res.rows.item(i);
        let statusTitle = status.title;
        console.log("status title " + statusTitle);
        me.statuses.push(status);
      }
    }).catch(e => alert(e));
  }
  getMaxOrderNo(status, parent, table): Promise<number | void>{
    let me = this;
    return me.db.executeSql('SELECT MAX(order_no) as maxorderno FROM ' + table + ' WHERE status = ? AND parent_id = ?', [status, parent])
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

  updateOrderNumbersUnder(status, parent, oldOrderNo, table): Promise<void> {
    let me = this;
    console.log("status is " + status + " parent " + parent + " oldorder_no " + oldOrderNo);
    return me.db.executeSql('SELECT * FROM ' + table + ' WHERE status = ? AND parent_id = ? AND order_no > ?', [status, parent, oldOrderNo])
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
        let query = "UPDATE " + table + " SET order_no = order_no - 1 WHERE id IN(" + str + '?)';

        return me.db.executeSql(query, ids);
      }
      else
        return;
    });
  }
}
