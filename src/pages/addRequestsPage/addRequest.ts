import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

@Component({
  selector: 'page-add-request',
  templateUrl: 'addRequest.html'
})
export class AddRequestPage {

  data = { title:"", description:"", status:"Doing", orderno: 0, createddt: new Date(), modifieddt: null};
  db : any;


  constructor(public navCtrl: NavController, public navParams: NavParams,
              private sqlite: SQLite,
              private toast: Toast) {}

  saveData() {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;
      this.db.executeSql('SELECT MAX(orderno) FROM request WHERE request.status = ?', [this.data.status])
      .then(maxOrderNo => {
        for(key in maxOrderNo) {
          if(maxOrderNo.hasOwnProperty(key)) {
              var value = maxOrderNo[key];
              //do something with value;
          }
        }
        maxOrderNo.forEach( (key, value) => {
          
        });
        console.log(Object.keys(maxOrderNo.rows.item));
        console.log(Object.keys(maxOrderNo.rows.item(0)));
        console.log(Object.values(maxOrderNo.rows.item));
        console.log(Object.toString(maxOrderNo.rows.item(0)));
        console.log("max no " + maxOrderNo.rows.item(0));
        let newOrderNo = maxOrderNo + 1;
        if(newOrderNo == 1)
          newOrderNo = 0;
        db.executeSql('INSERT INTO request VALUES(NULL,?,?,?,?,?, NULL)',[this.data.title,this.data.description,this.data.status,newOrderNo, new Date()])
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
    }).catch(e => {
      console.log(e);
      this.toast.show(e, '5000', 'center').subscribe(
        toast => {
          console.log(toast);
        }
      );
    });
  }
}
