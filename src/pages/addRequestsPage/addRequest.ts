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

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private sqlite: SQLite,
              private toast: Toast) {}

  saveData() {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('INSERT INTO request VALUES(NULL,?,?,?,?,?, NULL)',[this.data.title,this.data.description,this.data.status,this.data.orderno, this.data.createddt])
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
        db.executeSql('SELECT * FROM request', {})
        .then(res => {
          console.dir(res.rows);
        });
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
