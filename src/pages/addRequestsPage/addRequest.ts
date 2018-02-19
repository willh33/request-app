import { AppData } from './../../providers/app-data';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

@Component({
  selector: 'page-add-request',
  templateUrl: 'addRequest.html'
})
export class AddRequestPage {

  data = { title:"", description:"", status:"In Process", orderno: 0, createddt: new Date(), modifieddt: null};
  db : any;
  statuses = [];


  constructor(public navCtrl: NavController, public navParams: NavParams,
              private sqlite: SQLite, private appData: AppData,
              private toast: Toast) {

      this.db = this.appData.db;
      this.statuses = this.appData.statuses;
      console.log("add request page");
      this.statuses.forEach(status => {
        console.log("status " + status.title);
      });
  }

  saveData() {
    this.db = this.appData.db;
    this.db.executeSql('SELECT MAX(orderno) as maxorderno FROM request WHERE request.status = ?', [this.data.status])
    .then(res => {
      let maxOrderNo = res.rows.item(0).maxorderno;
      console.log(maxOrderNo);
      console.log("max order no " + res.rows.item(0).maxorderno);
      let newOrderNo = 0;
      if(maxOrderNo == null)
        newOrderNo = 0;
      else
        newOrderNo = maxOrderNo + 1
      if(this.data.status === "")
        this.data.status = "todo";
      this.db.executeSql('INSERT INTO request VALUES(NULL,?,?,?,?,?, NULL)',[this.data.title,this.data.description,this.data.status,newOrderNo, new Date()])
      .then(res => {
        console.log(res);
        this.toast.show('Data saved', '5000', 'center').subscribe(
          toast => {
            this.navCtrl.popToRoot();
          }
        );
      })
      .catch(e => {
        console.log(e);
        this.toast.show(e, '5000', 'center').subscribe(
          toast => {
            console.log(toast);
          }
        );
      });
    })
    .catch(e => alert(e));
  }
}
