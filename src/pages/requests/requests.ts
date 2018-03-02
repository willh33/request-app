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
    console.log("requset constructor");
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
      console.log("platform ready");
      //Once the platform is ready call a method in app data that gets teh statuses, It will check if the statuses are already inserted
      //and only insert them if they are not, it will return the statuses, to be used here.
      this.db = this.appData.db;

      console.log("before selecting statuses");

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
    let me = this;
    console.log("retrieve requests");
    me.db.executeSql('SELECT * FROM request order by orderno', {})
    .then(res => {
      console.log(res.rows.length + " res rows length");
      for(var i=0; i<res.rows.length; i++) {
        let item = res.rows.item(i);
        console.log("status ********* " + item.status + " title " +item.title);
        console.log("order number " + item.orderno);
        if(me.requests[item.status])
        {
          me.requests[item.status].push(
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
      me.totalRequests = res.rows.length;
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
      console.log("request type is in reorder array " + this.requestType);
      let arrayToReorder = this.requests[this.requestType];
      let element = arrayToReorder[from];
      arrayToReorder.splice(indexes.from, 1);
      arrayToReorder.splice(indexes.to, 0, element);
  }

  //Call this when a row is being moved up
  swapAndIncrement(from, to) {
    let me = this;
    //Select the row being moved
        console.log("increment");
        console.log("to " + to + " from " + from + " request tyep " + me.requestType);
      me.db.executeSql('SELECT * FROM request WHERE orderno = ? AND status = ?', [from, me.requestType])
    .then(draggedObject => {
      console.log("increment");
      console.log("to " + to + " from " + from + " request tyep " + me.requestType);
      console.log("dragged object title " + draggedObject.rows.item(0).title);
        //Select all the rows that need updated, All the rows in between to and from
        me.db.executeSql('SELECT * FROM request WHERE orderno >= ? AND orderno < ? and status = ? ORDER BY orderno', [to, from, me.requestType])
        .then(rows => {
          console.log("rows length in decrement " + rows.rows.length);
            //Update rows in between
            for(let i = 0; i < rows.rows.length; i++){
              let row = rows.rows.item(i);
              let rowid = row.rowid;

              me.db.executeSql('UPDATE request SET orderno = orderno + 1 WHERE rowid = ?', [rowid])
                .then(res => console.log(res))
                .catch(e => alert(e));
            }

            //Update the row that was dragged.
            let draggedRowId = draggedObject.rows.item(0).rowid;
            console.log("dragged row id is " + draggedRowId);
            me.db.executeSql("SELECT * FROM request WHERE rowid = ?", [draggedRowId]).then(res => {
                console.log("res rows length " + res.rows.length + " with row id " + draggedRowId) 
            });

            me.db.executeSql('UPDATE request SET orderno = ? WHERE rowid = ?', [to, draggedRowId])
                .then(res => {
                })
                .catch(e => alert(e));
        })
    })
    .catch(e => alert(e));
  }

  //Row is being moved down
  swapAndDecrement(from, to) {
    let me = this;
    //Select the row being moved
        console.log("Decrement");
        console.log("to " + to + " from " + from + " request tyep " + me.requestType);
      me.db.executeSql('SELECT * FROM request WHERE orderno = ? AND status = ?', [from, me.requestType])
    .then(draggedObject => {
      console.log("Decrement");
      console.log("to " + to + " from " + from + " request tyep " + me.requestType);
        //Select all the rows that need updated, All the rows in between to and from
        me.db.executeSql('SELECT * FROM request WHERE orderno > ? AND orderno <= ? and status = ? ORDER BY orderno', [from , to, me.requestType])
        .then(rows => {
          console.log("rows length in decrement " + rows.rows.length);
            //Update rows in between
            for(let i = 0; i < rows.rows.length; i++){
              let row = rows.rows.item(i);
              let rowid = row.rowid;

              me.db.executeSql('UPDATE request SET orderno = orderno - 1 WHERE rowid = ?', [rowid])
                .then(res => console.log(res))
                .catch(e => alert(e));
            }

            //Update the row that was dragged.
            let draggedRowId = draggedObject.rows.item(0).rowid;

            me.db.executeSql('UPDATE request SET orderno = ? WHERE rowid = ?', [to, draggedRowId])
                .then(res => {
                })
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
