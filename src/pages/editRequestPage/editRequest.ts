import { AppData } from './../../providers/app-data';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

@Component({
  selector: 'page-edit-request',
  templateUrl: 'editRequest.html',
})
export class EditRequestPage {

  data = { rowid:0, title:"", description:"", parent: "-1", status:"Doing", orderno: 0, createddt: new Date(), modifieddt: null};
  oldData = { rowid:0, title:"", description:"",  parent: "-1", status:"Doing", orderno: 0, createddt: new Date(), modifieddt: null};
  db : any;
  rowid :any;
  statuses = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private sqlite: SQLite, private appData: AppData,
    private toast: Toast) {
      console.log(" row id " + navParams.get("rowid"));
      this.db = this.appData.db;
      this.statuses = this.appData.statuses;
      this.rowid = navParams.get("rowid");
      this.getCurrentData(this.rowid);
  }

  getCurrentData(rowid) {
    let me = this;
    me.db.executeSql('SELECT * FROM request WHERE rowid=?', [rowid])
      .then(res => {
        if(res.rows.length > 0) {
          let item = res.rows.item(0);
          console.log("id " + item.rowid);
          this.data.rowid = item.rowid;
          this.data.title = item.title;
          this.data.description = item.description;
          this.data.status = item.status;
          this.data.orderno = item.orderno;
          this.data.createddt = item.createddt;
          this.data.modifieddt = new Date();
          this.data.parent = item.parentid;


          this.oldData.rowid = item.rowid;
          this.oldData.title = item.title;
          this.oldData.description = item.description;
          this.oldData.status = item.status;
          this.oldData.orderno = item.orderno;
          this.oldData.createddt = item.createddt;
          this.oldData.modifieddt = new Date();
          this.oldData.parent = item.parentid;
        }
      })
      .catch(e => {
        console.log(e);
        this.toast.show(e, '5000', 'center').subscribe(
          toast => {
            console.log(toast);
          }
        );
      });
  }

  updateData() {
    let me = this;
      if(me.oldData.status === me.data.status)
      {
        me.callUdpate(me.data.orderno);
      }
      else
      {
        // me.db.executeSql('SELECT MAX(orderno) as maxorderno FROM request WHERE request.status = ? AND request.parentid = ?', [me.data.status, me.data.parent])
        //   .then(res => {
        //     console.log("parent " + me.data.parent + " my new data status " + me.data.status);
        //     let maxOrderNo = res.rows.item(0).maxorderno;
        //     let newOrderNo = 0;
        //     if(maxOrderNo == null)
        //       newOrderNo = 0;
        //     else
        //       newOrderNo = maxOrderNo + 1
        //     me.updateOrderNumbers(me.oldData.status, me.oldData.parent, me.oldData.orderno, newOrderNo);
        //   })
        //   .catch(e => alert(e));
        me.appData.getMaxOrderNo(me.data.status, me.data.parent)
          .then(function(res) {
            me.updateOrderNumbers(me.oldData.status, me.oldData.parent, me.oldData.orderno, res);
          });

      }
    }

    updateOrderNumbers(status, parent, oldOrderNo, newOrderNo) {
      console.log("old order no " + oldOrderNo + " new order no " + newOrderNo);
      console.log("old status " + this.oldData.status + " new status " + this.data.status);
      let me = this;
      me.db.executeSql('SELECT * FROM request WHERE request.status = ? AND request.parentid = ? AND request.orderno > ?', [status, parent, oldOrderNo])
      .then(res => {
        console.log("got all the order numbers that need updated");
        let rowids = [];
        for(var i = 0; i < res.rows.length; i++)
        {
          let item = res.rows.item(i);
          rowids.push(item.rowid);
        }
        console.log('row ids that need updated are ' + rowids);
        me.db.executeSql("UPDATE request SET orderno = orderno - 1 WHERE rowid IN (?)", [rowids])
        .then(res => {
          console.log("udpated the order numbers rowids are " + rowids);
          me.callUdpate(newOrderNo);
        });
      });
    }

    callUdpate(orderno) {

    //It appears to update good other than the order number doesnt appear to be set to the max order number of the new status.
    let me = this;
    me.db.executeSql('UPDATE request SET title=?,description=?,status=?, orderno=?, modifieddt=? WHERE rowid=?',[this.data.title,this.data.description,this.data.status, orderno,new Date(), this.rowid])
      .then(res => {
        console.log("udpated the row being edited " + this.rowid);
        me.navCtrl.pop();
        // me.toast.show('Data updated', '5000', 'center').subscribe(
        //   toast => {
        //     me.navCtrl.popToRoot();
        //   }
        // );
      })
      .catch(e => {
        console.log(e);
        me.toast.show(e, '5000', 'center').subscribe(
          toast => {
            console.log(toast);
          }
      );
    });
  }
}
