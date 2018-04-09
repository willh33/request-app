import { StatusBar } from '@ionic-native/status-bar';
import { Component } from '@angular/core';
import { NavController, reorderArray, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AddRequestPage } from '../addRequestsPage/addRequest';
import { Platform } from 'ionic-angular';
import { EditRequestPage } from '../editRequestPage/editRequest';
import { AppData } from '../../providers/app-data';
import { PopoverController } from 'ionic-angular';
import { PopoverPage } from '../popoverPage/popoverPage'

@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html'
})
export class GroupsPage {
  selectedItem: any;
  icons: string[];
  requests = {'In Process': []};
  totalRequests : 0;
  requestType: "";
  db : any;
  statuses = [];
  parent = -1;
  title = "Requests";
  statusCount = {};


  constructor(public navCtrl: NavController, public navParams: NavParams, private sqlite: SQLite,  private platform: Platform, private appData: AppData, private popoverCtrl: PopoverController) {
    this.db = this.appData.db;
    this.statuses = this.appData.statuses;
    if(navParams.get("parent") !== undefined)
        this.parent = navParams.get("parent");
    console.log("this.parent is " + this.parent);
    this.statuses.forEach(status => {
        if(this.requestType == undefined)
            this.requestType = status.title;
        this.requests[status.title] = [];
        this.statusCount[status.title] = 0;
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverPage, {
        parent: this.parent,
        status: this.requestType
      },
      {
        cssClass: 'popover-div'
      }
    );
    popover.present({
      ev: myEvent
    });
  }

  changeStatusLeft(request) {
    let me = this;

    let currentStatusIndex = me.statuses.findIndex(status => status.title == this.requestType);

    if(currentStatusIndex < me.statuses.length)
    {
      let leftStatus = me.statuses[currentStatusIndex - 1];
      me.appData.getMaxorderNo(leftStatus.title, this.parent)
        .then(function(res) {
          console.log("new order number is " + res);
          console.log("left status " + leftStatus);
          me.db.executeSql('UPDATE request SET status=?, order_no=?, modified_dt=? WHERE id=?',[leftStatus.title, res, new Date(), request.id])
          .then(res => {
            me.appData.updateOrderNumbersUnder(request.status, me.parent, request.orderNo)
              .then(function(res) {
                me.resetRequests();
              });
          });
        });
    }
  }

  changeStatusRight(request) {
    let me = this;

    let currentStatusIndex = me.statuses.findIndex(status => status.title == me.requestType);

    if(currentStatusIndex < me.statuses.length)
    {
      let rightStatus = me.statuses[currentStatusIndex + 1];
      me.appData.getMaxorderNo(rightStatus.title, me.parent)
        .then(function(res) {
          console.log("new order number is " + res);
          console.log("right status " + rightStatus);
          me.db.executeSql('UPDATE request SET status=?, order_no=?, modified_dt=? WHERE id=?',[rightStatus.title, res, new Date(), request.id])
          .then(res => {
            me.appData.updateOrderNumbersUnder(request.status, me.parent, request.order_no)
              .then(function(res) {
                me.resetRequests();
              });
          });
        });
    }
  }

  resetRequests() {
    //set all the setup data
    this.db = this.appData.db;
    this.statuses = this.appData.statuses;
    this.statuses.forEach(status => {
      if(this.requestType == undefined)
          this.requestType = status.title;
      this.requests[status.title] = [];
      this.statusCount[status.title] = 0;
    });
    this.retrieveRequests();
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(GroupsPage, {
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
      this.resetRequests();
    });
  }

  retrieveRequests() {
    let me = this;
    if(this.parent === 0)
      this.title = "Requests";
    else {
        me.db.executeSql('SELECT * FROM request WHERE id = ? ORDER BY order_no', [me.parent]).then(res => {
            if(res.rows.length > 0)
                this.title = res.rows.item(0).title;
      });
    }
    me.db.executeSql('SELECT * FROM request WHERE parent_id = ? ORDER BY order_no', [me.parent])
    .then(res => {
      for(var i=0; i<res.rows.length; i++) {
        let item = res.rows.item(i);
        console.log("status ********* " + item.status + " title " +item.title);
        console.log("order number " + item.order_no);
        if(me.requests[item.status])
        {
          me.requests[item.status].push(
            {
              id:item.id,
              title:item.title,
              description:item.description,
              status:item.status,
              order_no:item.order_no,
              createddt:item.createddt,
              modified_dt:item.modified_dt
            });
            this.statusCount[item.status] = this.statusCount[item.status] + 1;
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
      let arrayToReorder = this.requests[this.requestType];
      let element = arrayToReorder[from];
      arrayToReorder.splice(indexes.from, 1);
      arrayToReorder.splice(indexes.to, 0, element);
  }

  //Call this when a row is being moved up
  swapAndIncrement(from, to) {
    let me = this;
    //Select the row being moved
      me.db.executeSql('SELECT * FROM request WHERE order_no = ? AND status = ? AND parent_id = ?', [from, me.requestType, me.parent])
          .then(draggedObject => {
              console.log("dragged object length " + draggedObject.rows.length);
        //Select all the rows that need updated, All the rows in between to and from
              me.db.executeSql('SELECT * FROM request WHERE order_no >= ? AND order_no < ? and status = ? AND parent_id = ? ORDER BY order_no', [to, from, me.requestType, me.parent])
        .then(rows => {
            //Update rows in between
            console.log("rows to update " + rows.rows.length);
            for(let i = 0; i < rows.rows.length; i++){
                let row = rows.rows.item(i);
                let id = row.id;
                console.log("update row with title " + row.title);

                me.db.executeSql('UPDATE request SET order_no = order_no + 1 WHERE id = ?', [id])
                    .then(res => console.log(res))
                    .catch(e => alert(e));
            }

            //Update the row that was dragged.
            let draggedid = draggedObject.rows.item(0).id;

            me.db.executeSql('UPDATE request SET order_no = ? WHERE id = ?', [to, draggedid])
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
      me.db.executeSql('SELECT * FROM request WHERE order_no = ? AND status = ? AND parent_id = ?', [from, me.requestType, me.parent])
    .then(draggedObject => {
        //Select all the rows that need updated, All the rows in between to and from
        me.db.executeSql('SELECT * FROM request WHERE order_no > ? AND order_no <= ? and status = ? AND parent_id = ? ORDER BY order_no', [from , to, me.requestType, me.parent])
        .then(rows => {
            //Update rows in between
            for(let i = 0; i < rows.rows.length; i++){
              let row = rows.rows.item(i);
              let id = row.id;

              me.db.executeSql('UPDATE request SET order_no = order_no - 1 WHERE id = ?', [id])
                .then(res => console.log(res))
                .catch(e => alert(e));
            }

            //Update the row that was dragged.
            let draggedid = draggedObject.rows.item(0).id;

            me.db.executeSql('UPDATE request SET order_no = ? WHERE id = ?', [to, draggedid])
                .then(res => {
                })
                .catch(e => alert(e));
        })
    })
    .catch(e => alert(e));
  }


  addData() {
    this.navCtrl.push(AddRequestPage,{
      parent: this.parent,
      status: this.requestType
    });
  }

  goToNewRequestPageContext(id) {
    this.navCtrl.push(GroupsPage, {
      parent:id
    });
  }

  editData(id) {
    this.navCtrl.push(EditRequestPage, {
      id: id
    });
  }

  deleteData(id) {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('DELETE FROM request WHERE id=?', [id])
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
