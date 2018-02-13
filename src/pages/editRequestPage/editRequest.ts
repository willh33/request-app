import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

@Component({
  selector: 'page-edit-request',
  templateUrl: 'editRequest.html',
})
export class EditRequestPage {

  data = { rowid:0, title:"", description:"", status:"Doing", orderno: 0, createddt: new Date(), modifieddt: null};

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private sqlite: SQLite,
    private toast: Toast) {
      console.log(" row id " + navParams.get("rowid"));
      this.getCurrentData(navParams.get("rowid"));
  }

  getCurrentData(rowid) {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM request WHERE rowid=?', [rowid])
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
    }).catch(e => {
      console.log(e);
      this.toast.show(e, '5000', 'center').subscribe(
        toast => {
          console.log(toast);
        }
      );
    });
  }

  updateData() {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('UPDATE request SET title=?,description=?,status=?, modifieddt=? WHERE rowid=?',[this.data.title,this.data.description,this.data.status,new Date(), this.data.rowid])
        .then(res => {
          console.log(res);
          this.toast.show('Data updated', '5000', 'center').subscribe(
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
