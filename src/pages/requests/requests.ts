import { Component } from '@angular/core';
import { NavController, reorderArray, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AddRequestPage } from '../addRequestsPage/addRequest';
import { Platform } from 'ionic-angular';
import { EditRequestPage } from '../editRequestPage/editRequest';

@Component({
  selector: 'page-requests',
  templateUrl: 'requests.html'
})
export class RequestsPage {
  selectedItem: any;
  icons: string[];
  requests = {'todo': [], 'doing': [], 'done': []};
  totalRequests : 0;
  requestType: "doing";

  constructor(public navCtrl: NavController, public navParams: NavParams, private sqlite: SQLite,  private platform: Platform) {
    this.requests = {'todo': [], 'doing': [], 'done': []};
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(RequestsPage, {
      item: item
    });
  }

  ionViewDidLoad() {
    // this.platform.ready().then(() => {
    //   console.log("getting data ")
    //   this.getData();
    // });
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.getData();
    });
  }

  getData() {
    this.requests = {'todo': [], 'doing': [], 'done': []};
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('CREATE TABLE IF NOT EXISTS request(rowid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT, orderno, createddt TEXT, modifieddt TEXT)', {})
      .then(res => console.log('Executed SQL'))
      .catch(e => alert(e));
      db.executeSql('SELECT * FROM request', {})
      .then(res => {
        for(var i=0; i<res.rows.length; i++) {
          let item = res.rows.item(i);
          console.log("status " + item.status + " id " +item.rowid);

          if(this.requests[item.status])
          {
            this.requests[item.status].push(
              {
                rowid:item.rowid,
                title:item.title,
                description:item.description,
                status:item.status,
                orderno:item.orderno,
                createddt:item.createddt,
                modifieddt:item.modifieddt
              })
          }
        }
        this.totalRequests = res.rows.length;
      }).catch(e => alert(e));
    }).catch(e => alert(e));
    console.dir()
  }

  reorderItems (indexes){
      this.requests.todo = reorderArray(this.requests.todo, indexes);
      this.requests.doing = reorderArray(this.requests.doing, indexes);
      this.requests.done = reorderArray(this.requests.done, indexes);
  }

  addData() {
    this.navCtrl.push(AddRequestPage);
  }

  editData(rowid) {
    this.navCtrl.push(EditRequestPage, {
      rowid:rowid
    });
  }

  // editData(rowid) {
  //   this.navCtrl.push(EditDataPage, {
  //     rowid:rowid
  //   });
  // }

  deleteData(rowid) {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('DELETE FROM request WHERE rowid=?', [rowid])
      .then(res => {
        console.log(res);
        this.getData();
      })
      .catch(e => console.log(e));
    }).catch(e => console.log(e));
  }

  getRequests(type: any) {
    console.log("type " + type);
    return this.requests[type];;
  }
}

// "scripts": {
//   "clean": "ionic-app-scripts clean",
//   "build": "ionic-app-scripts build",
//   "lint": "ionic-app-scripts lint",
//   "ionic:build": "ionic-app-scripts build",
//   "ionic:serve": "ionic-app-scripts serve"
// },
