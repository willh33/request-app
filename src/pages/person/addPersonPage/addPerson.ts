import { AppData } from './../../../providers/app-data';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

@Component({
  selector: 'page-add-person',
  templateUrl: 'addPerson.html'
})
export class AddPersonPage {
  // first_name TEXT, middle_name TEXT, last_name TEXT, parent_id INTEGER,
  data = { first_name:"", middle_name:"", last_name:"", parent_id: 0, orderno: 0, createddt: new Date(), modifieddt: null};
  db : any;
  // statuses = [];
  parent = 0;


  constructor(public navCtrl: NavController, public navParams: NavParams,
              private sqlite: SQLite, private appData: AppData,
              private toast: Toast) {

      this.db = this.appData.db;
      // this.statuses = this.appData.statuses;

      this.parent = navParams.get('parent');
      // this.data.status = navParams.get('status');
  }

  saveData() {
    let me = this;
    me.db = me.appData.db;
    me.db.executeSql('SELECT MAX(order_no) as maxorderno FROM person WHERE parent_id = ?', [me.parent])
    .then(res => {
      let maxOrderNo = res.rows.item(0).maxorderno;
      let newOrderNo = 0;
      if(maxOrderNo == null)
        newOrderNo = 0;
      else
        newOrderNo = maxOrderNo + 1

        me.db.executeSql('INSERT INTO person (first_name, middle_name, last_name, parent_id, order_no, created_dt, modified_dt) VALUES(?,?,?,?,?,?, NULL)',[me.data.first_name, me.data.middle_name, me.data.last_name, this.parent, newOrderNo, new Date()])
            .then(res => {
                console.log(res);
                me.navCtrl.pop();
                /**me.toast.show('Data saved', '5000', 'center').subscribe(
                    toast => {
                        console.log("navctrl pop");
                        me.navCtrl.pop();
                    }
                );**/
      })
      .catch(e => {
        console.log(e);
        me.toast.show(e, '5000', 'center').subscribe(
          toast => {
            console.log(toast);
          }
        );
      });
    })
    .catch(e => alert(e));
  }
}
