import { PersonPopoverPage } from './../personPopoverPage/personPopoverPage';

import { StatusBar } from '@ionic-native/status-bar';
import { Component } from '@angular/core';
import { NavController, reorderArray, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AddRequestPage } from '../../requests/addRequestsPage/addRequest';
import { Platform } from 'ionic-angular';
import { EditRequestPage } from '../../requests/editRequestPage/editRequest';
import { AppData } from '../../../providers/app-data';
import { PopoverController } from 'ionic-angular';

@Component({
  selector: 'page-person',
  templateUrl: 'person.html'
})
export class PersonPage {
  selectedItem: any;
  icons: string[];
  people = [];
  totalPeople : 0;
  // groupType: "";
  db : any;
  // statuses = [];
  parent = -1;
  title = "People";
  // statusCount = {};
  tableName: "person"


  constructor(public navCtrl: NavController, public navParams: NavParams, private sqlite: SQLite,  private platform: Platform, private appData: AppData, private popoverCtrl: PopoverController) {
    this.db = this.appData.db;
    // this.statuses = this.appData.statuses;
    if(navParams.get("parent") !== undefined)
        this.parent = navParams.get("parent");
    console.log("this.parent is " + this.parent);
    this.people = [];
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PersonPopoverPage, {
        parent: this.parent
        // status: this.groupType
      },
      {
        cssClass: 'popover-div'
      }
    );
    console.log("created popover");
    popover.present({
      ev: myEvent
    });
    console.log("presented popover");
  }

// changeStatusLeft(group) {
//     let me = this;

//     let currentStatusIndex = me.statuses.findIndex(status => status.title == this.groupType);

//     if(currentStatusIndex < me.statuses.length)
//     {
//       let leftStatus = me.statuses[currentStatusIndex - 1];
//       me.appData.getMaxOrderNo(leftStatus.title, this.parent, me.tableName)
//         .then(function(res) {
//           console.log("new order number is " + res);
//           console.log("left status " + leftStatus);
//           me.db.executeSql('UPDATE groups SET status=?, order_no=?, modified_dt=? WHERE id=?',[leftStatus.title, res, new Date(), group.id])
//           .then(res => {
//             me.appData.updateOrderNumbersUnder(group.status, me.parent, group.order_no, me.tableName)
//               .then(function(res) {
//                 me.resetGroups();
//               });
//           });
//         });
//     }
//   }

// changeStatusRight(group) {
//     let me = this;

//     let currentStatusIndex = me.statuses.findIndex(status => status.title == me.groupType);

//     if(currentStatusIndex < me.statuses.length)
//     {
//       let rightStatus = me.statuses[currentStatusIndex + 1];
//       me.appData.getMaxOrderNo(rightStatus.title, me.parent, 'groups')
//         .then(function(res) {
//           console.log("new order number is " + res);
//           console.log("right status " + rightStatus.title);
//           me.db.executeSql('UPDATE groups SET status=?, order_no=?, modified_dt=? WHERE id=?',[rightStatus.title, res, new Date(), group.id])
//           .then(res => {
//             me.appData.updateOrderNumbersUnder(group.status, me.parent, group.order_no, me.tableName)
//               .then(function(res) {
//                 me.resetGroups();
//               });
//           });
//         });
//     }
//   }

  resetPeople() {
    //set all the setup data
    this.db = this.appData.db;
    // this.statuses = this.appData.statuses;
    this.people = [];
    // this.statuses.forEach(status => {
    //   if(this.groupType == undefined)
    //       this.groupType = status.title;
    //   console.log("just before resetting requests " + status.title);
    //   this.groups[status.title] = [];
    //   this.statusCount[status.title] = 0;
    // });
    this.retrievePeople();
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(PersonPage, {
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
      this.resetPeople();
    });
  }

  retrievePeople() {
    let me = this;
    if(this.parent === 0)
      this.title = "People";
    else {
        me.db.executeSql('SELECT * FROM person WHERE id = ? ORDER BY order_no', [me.parent]).then(res => {
            if(res.rows.length > 0)
                this.title = res.rows.item(0).first_name +  " " + res.rows.item(0).middle_name + " " + res.rows.item(0).last_name;
      });
    }
    me.db.executeSql('SELECT * FROM person WHERE parent_id = ? ORDER BY order_no', [me.parent])
    .then(res => {
      for(var i=0; i<res.rows.length; i++) {
        let item = res.rows.item(i);
        console.log("order number " + item.order_no);
            me.people.push(
          // me.groups[item.status].push(
            {
              id:item.id,
              firstName:item.first_name,
              middleName:item.middle_name,
              lastName:item.last_name,
              parent:item.parent_id,
              order_no:item.order_no,
              createddt:item.createddt,
              modified_dt:item.modified_dt
            });
            // me.statusCount[item.status] = this.statusCount[item.status] + 1;
      }
      me.totalPeople = res.rows.length;
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
      let arrayToReorder = this.people;
      // let arrayToReorder = this.groups[this.groupType];
      let element = arrayToReorder[from];
      arrayToReorder.splice(indexes.from, 1);
      arrayToReorder.splice(indexes.to, 0, element);
  }

  //Call this when a row is being moved up
  swapAndIncrement(from, to) {
    let me = this;
    //Select the row being moved
      me.db.executeSql('SELECT * FROM person WHERE order_no = ? AND parent_id = ?', [from, me.parent])
          .then(draggedObject => {
              console.log("dragged object length " + draggedObject.rows.length);
        //Select all the rows that need updated, All the rows in between to and from
              me.db.executeSql('SELECT * FROM person WHERE order_no >= ? AND order_no < ? AND parent_id = ? ORDER BY order_no', [to, from, me.parent])
        .then(rows => {
            //Update rows in between
            console.log("rows to update " + rows.rows.length);
            for(let i = 0; i < rows.rows.length; i++){
                let row = rows.rows.item(i);
                let id = row.id;
                console.log("update row with title " + row.title);

                me.db.executeSql('UPDATE person SET order_no = order_no + 1 WHERE id = ?', [id])
                    .then(res => console.log(res))
                    .catch(e => alert(e));
            }

            //Update the row that was dragged.
            let draggedid = draggedObject.rows.item(0).id;

            me.db.executeSql('UPDATE person SET order_no = ? WHERE id = ?', [to, draggedid])
                .then(res => {
                })
                .catch(e => alert(e));
        })
    })
    .catch(e => alert(e));
  }

  // //Row is being moved down
  swapAndDecrement(from, to) {
    let me = this;
    //Select the row being moved
      me.db.executeSql('SELECT * FROM person WHERE order_no = ? AND parent_Id = ?', [from, me.parent])
    .then(draggedObject => {
        //Select all the rows that need updated, All the rows in between to and from
        me.db.executeSql('SELECT * FROM person WHERE order_no > ? AND order_no <= ? AND parent_Id = ? ORDER BY order_no', [from , to, me.parent])
        .then(rows => {
            //Update rows in between
            for(let i = 0; i < rows.rows.length; i++){
              let row = rows.rows.item(i);
              let id = row.id;

              me.db.executeSql('UPDATE person SET order_no = order_no - 1 WHERE id = ?', [id])
                .then(res => console.log(res))
                .catch(e => alert(e));
            }

            //Update the row that was dragged.
            let draggedid = draggedObject.rows.item(0).id;

            me.db.executeSql('UPDATE person SET order_no = ? WHERE id = ?', [to, draggedid])
                .then(res => {
                })
                .catch(e => alert(e));
        })
    })
    .catch(e => alert(e));
  }


  addData() {
    this.navCtrl.push(AddRequestPage,{
      parent: this.parent
      // status: this.groupType
    });
  }

  goToNewPersonPageContext(id) {
    this.navCtrl.push(PersonPage, {
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
      db.executeSql('DELETE FROM person WHERE id=?', [id])
      .then(res => {
        console.log(res);
        this.retrievePeople();
      })
      .catch(e => console.log(e));
    }).catch(e => console.log(e));
  }

  // getGroups(type: any) {
  //   return this.groups[type];;
  // }
  // contentChanged(title: any) {
  //   this.groupType = title;
  // }
}

// "scripts": {
//   "clean": "ionic-app-scripts clean",
//   "build": "ionic-app-scripts build",
//   "lint": "ionic-app-scripts lint",
//   "ionic:build": "ionic-app-scripts build",
//   "ionic:serve": "ionic-app-scripts serve"
// },
