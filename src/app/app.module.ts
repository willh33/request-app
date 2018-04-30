import { EditPersonPage } from './../pages/person/editPersonPage/editPerson';
import { AddPersonPage } from './../pages/person/addPersonPage/addPerson';
import { PersonPopoverPage } from './../pages/person/personPopoverPage/personPopoverPage';
import { PersonPage } from './../pages/person/person/person';
import { GroupPopoverPage } from './../pages/groups/groupPopoverPage/groupPopoverPage';
import { RequestPopoverPage } from './../pages/requests/requestPopoverPage/requestPopoverPage';
import { EditGroupPage } from './../pages/groups/editGroupPage/editGroup';
import { AddGroupPage } from './../pages/groups/addGroupPage/addGroup';
import { AppData } from './../providers/app-data';
import { Toast } from '@ionic-native/toast';
import { SQLite } from '@ionic-native/sqlite';
import { GroupsPage } from '../pages/groups/groups/groups';
import { RequestsPage } from './../pages/requests/requests/requests';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AddRequestPage } from '../pages/requests/addRequestsPage/addRequest';
import { EditRequestPage } from '../pages/requests/editRequestPage/editRequest';

@NgModule({
  declarations: [
    MyApp,
    GroupsPage,
    RequestsPage,
    AddRequestPage,
    EditRequestPage,
    RequestPopoverPage,
    GroupsPage,
    AddGroupPage,
    EditGroupPage,
    GroupPopoverPage,
    PersonPage,
    AddPersonPage,
    EditPersonPage,
    PersonPopoverPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    GroupsPage,
    RequestsPage,
    AddRequestPage,
    EditRequestPage,
    RequestPopoverPage,
    GroupPopoverPage,
    AddGroupPage,
    EditGroupPage,
    GroupsPage,
    PersonPage,
    AddPersonPage,
    EditPersonPage,
    PersonPopoverPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SQLite,
    Toast,
    AppData
  ]
})
export class AppModule {}
