import { AppData } from './../../../providers/app-data';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

@Component({
  selector: 'page-edit-person',
  templateUrl: 'editPerson.html',
})
export class EditPersonPage {

  data = { id:0, first_name:"", middle_name:"", last_name:"", parent: "-1", order_no: 0, created_dt: null, modified_dt: new Date()};
  oldData = { id:0, first_name:"", middle_name:"", last_name:"",  parent: "-1", order_no: 0,  created_dt: null, modified_dt: new Date()};
  db : any;
  id :any;
  statuses = [];
  tableName: 'person';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private sqlite: SQLite, private appData: AppData,
    private toast: Toast) {
      console.log(" row id " + navParams.get("id"));
      this.db = this.appData.db;
      this.statuses = this.appData.statuses;
      this.id = navParams.get("id");
      this.getCurrentData(this.id);
  }

  getCurrentData(id) {
    let me = this;
    me.db.executeSql('SELECT * FROM person WHERE id=?', [id])
      .then(res => {
        if(res.rows.length > 0) {
          let item = res.rows.item(0);
          console.log("id " + item.id);
          this.data.id = item.id;
          this.data.first_name = item.first_name;
          this.data.middle_name = item.middle_name;
          this.data.last_name = item.last_name;
          this.data.order_no = item.order_no;
          this.data.created_dt = item.created_dt;
          this.data.modified_dt = new Date();
          this.data.parent = item.parentid;


          this.oldData.id = item.id;
          this.oldData.first_name = item.first_name;
          this.oldData.middle_name = item.middle_name;
          this.oldData.last_name = item.last_name;
          this.oldData.order_no = item.order_no;
          this.oldData.created_dt = item.created_dt;
          this.oldData.modified_dt = new Date();
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
      me.callUdpate(me.data.order_no);
    }

    // updateOrderNumbers(parent, oldorder_no, neworder_no) {
    //   console.log("old order no " + oldorder_no + " new order no " + neworder_no);
    //   let me = this;
    //   me.appData.updateOrderNumbersUnderWithoutStatus(parent, oldorder_no, me.tableName)
    //     .then(res => {
    //       me.callUdpate(neworder_no);
    //   });
    // }

    callUdpate(order_no) {

    //It appears to update good other than the order number doesnt appear to be set to the max order number of the new status.
    let me = this;
    me.db.executeSql('UPDATE person SET first_name=?,middle_name=?,last_name=?, order_no=?, modified_dt=? WHERE id=?',[this.data.first_name,this.data.middle_name, this.data.last_name, order_no,new Date(), this.id])
      .then(res => {
        console.log("udpated the row being edited " + this.id);
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
