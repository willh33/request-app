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
import { PopoverPage } from '../pages/requests/popoverPage/popoverPage';

@NgModule({
  declarations: [
    MyApp,
    GroupsPage,
    RequestsPage,
    AddRequestPage,
    EditRequestPage,
    PopoverPage,
    GroupsPage
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
    PopoverPage,
    GroupsPage
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
