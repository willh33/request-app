import { EditRequestPage } from './../editRequestPage/editRequest';
import { AddRequestPage } from './../addRequestsPage/addRequest';
import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, App } from 'ionic-angular';

@Component({
  selector: 'page-popover',
  template: `
    <ion-list class="popover-list">
       <button ion-item (click)="addRequest()">Add Request</button>
       <button ion-item (click)="editRequest()" *ngIf="id != -1">Edit Request</button>
    </ion-list>
  `
})
export class PopoverPage {
  id: any;
  status: any;

  constructor(private navParams: NavParams, public navCtrl: NavController, public viewCtrl: ViewController, public app: App) {

  }

  ngOnInit() {
    if (this.navParams.data) {
      this.id = this.navParams.data.parent;
      this.status = this.navParams.data.status;
    }
  }

  addRequest() {
    // this.viewCtrl.dismiss();
    this.viewCtrl.dismiss().then(() => {
      this.app.getRootNav().push(AddRequestPage,{
        parent: this.id,
        status: this.status
      });
    });
  }

  editRequest() {
    this.viewCtrl.dismiss().then(() => {
      this.app.getRootNav().push(EditRequestPage,{
        id: this.id
      });
    });
  }
}
