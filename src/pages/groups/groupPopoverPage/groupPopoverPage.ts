import { EditGroupPage } from './../editGroupPage/editGroup';
import { AddGroupPage } from './../addGroupPage/addGroup';
import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, App } from 'ionic-angular';

@Component({
  selector: 'page-group-popover',
  template: `
    <ion-list class="popover-list">
       <button ion-item (click)="addGroup()">Add Group</button>
       <button ion-item (click)="editGroup()" *ngIf="id != -1">Edit Group</button>
    </ion-list>
  `
})
export class GroupPopoverPage {
  id: any;
  status: any;

  constructor(private navParams: NavParams, public navCtrl: NavController, public viewCtrl: ViewController, public app: App) {
    console.log("constructor of group popover page");
  }

  ngOnInit() {
    console.log("on init");
    if (this.navParams.data) {
      console.log("had data");
      this.id = this.navParams.data.parent;
      this.status = this.navParams.data.status;
    }
  }

  addGroup() {
    // this.viewCtrl.dismiss();
    this.viewCtrl.dismiss().then(() => {
      this.app.getRootNav().push(AddGroupPage,{
        parent: this.id,
        status: this.status
      });
    });
  }

  editGroup() {
    this.viewCtrl.dismiss().then(() => {
      this.app.getRootNav().push(EditGroupPage,{
        id: this.id
      });
    });
  }
}
