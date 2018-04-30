import { EditPersonPage } from './../editPersonPage/editPerson';
import { AddPersonPage } from './../addPersonPage/addPerson';
import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, App } from 'ionic-angular';

@Component({
  selector: 'page-person-popover',
  template: `
    <ion-list class="popover-list">
       <button ion-item (click)="addPerson()">Add Person</button>
       <button ion-item (click)="editPerson()" *ngIf="id != -1">Edit Person</button>
    </ion-list>
  `
})
export class PersonPopoverPage {
  id: any;
  status: any;

  constructor(private navParams: NavParams, public navCtrl: NavController, public viewCtrl: ViewController, public app: App) {
    console.log("constructor of person popover page");
  }

  ngOnInit() {
    console.log("on init");
    if (this.navParams.data) {
      console.log("had data");
      this.id = this.navParams.data.parent;
      this.status = this.navParams.data.status;
    }
  }

  addPerson() {
    // this.viewCtrl.dismiss();
    this.viewCtrl.dismiss().then(() => {
      this.app.getRootNav().push(AddPersonPage,{
        parent: this.id,
        status: this.status
      });
    });
  }

  editPerson() {
    this.viewCtrl.dismiss().then(() => {
      this.app.getRootNav().push(EditPersonPage,{
        id: this.id
      });
    });
  }
}
