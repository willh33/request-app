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
  db : any;

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
      this.db = db;
      db.executeSql('CREATE TABLE IF NOT EXISTS request(rowid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT, orderno, createddt TEXT, modifieddt TEXT)', {})
      .then(res => console.log('Executed SQL'))
      .catch(e => alert(e));
      db.executeSql('SELECT * FROM request order by orderno', {})
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
      let from = indexes.from;
      let to = indexes.to;
      if(from > to)
      {
        //increment rows above it once
        this.swapAndIncrement(from, to);
      }
      else
      {
        //decrement corresponding rows once

        this.swapAndDecrement(from, to);
      }
      this.requests.todo = reorderArray(this.requests.todo, indexes);
      this.requests.doing = reorderArray(this.requests.doing, indexes);
      this.requests.done = reorderArray(this.requests.done, indexes);
      console.log("id " + indexes);
  }

  swapAndIncrement(from, to) {
    console.log("from " + from +" To " + to)
    //Select the row being moved
    this.db.executeSql('SELECT * FROM request WHERE request.orderno = ?', {from})
    .then(draggedObject => {
        //Select all the rows that need updated, All the rows in between to and from
        this.db.executeSql('SELECT * FROM request WHERE orderno >= ? AND orderno < ? and status = ? ORDER BY orderno', [to, from, this.requestType])
        .then(rows => {
            //Update rows in between
            rows.forEach(row => {
                let rowid = row.rowid;
                this.db.executeSql('UPDATE request SET orderno = orderno + 1 WHERE rowid = ?', [rowid])
                .then(res => console.log(res))
                .catch(e => alert(e));
            });

            //Update the row that was dragged.
            let rowid = draggedObject.rowid;
            this.db.executeSql('UPDATE request SET orderno = ? WHERE rowid = ?', [to, rowid])
                .then(res => console.log(res))
                .catch(e => alert(e));
        })
    })
    .catch(e => alert(e));
  }
  swapAndDecrement(from, to) {
    console.log("from " + from +" To " + to)
    //Select the row being moved
    this.db.executeSql('SELECT * FROM request WHERE request.orderno = ?', {from})
    .then(draggedObject => {
        //Select all the rows that need updated, All the rows in between to and from
        this.db.executeSql('SELECT * FROM request WHERE orderno > ? AND orderno <= ? and status = ? ORDER BY orderno', [from , to, this.requestType])
        .then(rows => {
            //Update rows in between
            rows.forEach(row => {
                let rowid = row.rowid;
                this.db.executeSql('UPDATE request SET orderno = orderno - 1 WHERE rowid = ?', [rowid])
                .then(res => console.log(res))
                .catch(e => alert(e));
            });

            //Update the row that was dragged.
            let rowid = draggedObject.rowid;
            this.db.executeSql('UPDATE request SET orderno = ? WHERE rowid = ?', [to, rowid])
                .then(res => console.log(res))
                .catch(e => alert(e));
        })
    })
    .catch(e => alert(e));


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
