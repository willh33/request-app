import { Component } from '@angular/core';
import { NavController, reorderArray, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AddRequestPage } from '../addRequestsPage/addRequest';
import { Platform } from 'ionic-angular';
import { EditRequestPage } from '../editRequestPage/editRequest';
import { AppData } from '../../providers/app-data';

@Component({
  selector: 'page-requests',
  templateUrl: 'requests.html'
})
export class RequestsPage {
  selectedItem: any;
  icons: string[];
  requests = {'In Process': []};
  totalRequests : 0;
  requestType: "In Process";
  db : any;
  statuses = [];


  constructor(public navCtrl: NavController, public navParams: NavParams, private sqlite: SQLite,  private platform: Platform, private appData: AppData) {
    this.db = this.appData.db;
    this.statuses = this.appData.statuses;
    this.statuses.forEach(status => {
      this.requests[status.title] = [];
      console.log("status in constructor " + status.title);
    });
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(RequestsPage, {
      item: item
    });
  }

  ionViewDidLoad() {
    console.log("ion view did load ");
    // this.platform.ready().then(() => {
    //   console.log("getting data ")
    //   this.getData();
    // });
  }

  ionViewWillEnter() {
    console.log("will enter ");
    this.platform.ready().then(() => {
      this.db = this.appData.db;
      this.statuses = this.appData.statuses;
      this.statuses.forEach(status => {
        this.requests[status.title] = [];
        console.log("status in constructor " + status.title);
      });
      console.log("platform ready");
      this.retrieveRequests();
    });
  }

  retrieveRequests() {
    console.log("retrieve requests");
    this.db.executeSql('SELECT * FROM request order by orderno', {})
    .then(res => {
      console.log(res.rows.length + " res rows length");
      for(var i=0; i<res.rows.length; i++) {
        let item = res.rows.item(i);
        console.log("status ********* " + item.status + " title " +item.title);

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
      for(var prop in this.requests)
      {
        if (this.requests.hasOwnProperty(prop)) {
          reorderArray(this.requests[prop], indexes);
        }
      }
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
        this.retrieveRequests();
      })
      .catch(e => console.log(e));
    }).catch(e => console.log(e));
  }

  getRequests(type: any) {
    console.log("request type " + this.requestType);
    console.log("type " + type);
    return this.requests[type];;
  }
  contentChanged(title: any) {
    this.requestType = title;
  }
}

// "scripts": {
//   "clean": "ionic-app-scripts clean",
//   "build": "ionic-app-scripts build",
//   "lint": "ionic-app-scripts lint",
//   "ionic:build": "ionic-app-scripts build",
//   "ionic:serve": "ionic-app-scripts serve"
// },
