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
  oldData = { rowid:0, title:"", description:"", status:"Doing", orderno: 0, createddt: new Date(), modifieddt: null};
  db : any;

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
      this.db = db;
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


            this.oldData.rowid = item.rowid;
            this.oldData.title = item.title;
            this.oldData.description = item.description;
            this.oldData.status = item.status;
            this.oldData.orderno = item.orderno;
            this.oldData.createddt = item.createddt;
            this.oldData.modifieddt = new Date();
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
      if(this.oldData.status === this.data.status)
      {
        this.callUdpate(this.data.orderno);
      }
      else
      {
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
            this.callUdpate(newOrderNo);
          })
          .catch(e => alert(e));
      }
    }

    callUdpate(orderno) {
      this.db.executeSql('UPDATE request SET title=?,description=?,status=?, orderno=?, modifieddt=? WHERE rowid=?',[this.data.title,this.data.description,this.data.status, orderno,new Date(), this.data.rowid])
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
  }
}
