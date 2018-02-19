import { AppData } from './../providers/app-data';
import { GroupsPage } from './../pages/groups/groups';
import { RequestsPage } from './../pages/requests/requests';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private appData : AppData) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Requests', component: RequestsPage },
      { title: 'Groups', component: GroupsPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.appData.createDatabaseAndTables().then(res => {
        this.rootPage = RequestsPage;
      });
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
