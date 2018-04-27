import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AppData } from './../providers/app-data';
import { GroupsPage } from './../pages/groups/groups/groups';
import { RequestsPage } from './../pages/requests/requests/requests';
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
  db: any;
  currentVersion;
  statuses = [];
  latestVersion = 3;

  //Create all the versions
  version1 = {
    versionNumber: 1,
    queries: [
      "CREATE TABLE IF NOT EXISTS status (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, abbreviation TEXT, color TEXT, created_dt DATE, modified_dt DATE, CONSTRAINT title_unique UNIQUE (title))",
      "CREATE TABLE IF NOT EXISTS request (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, parent_id INTEGER, status TEXT, order_no INTEGER, created_dt DATE, modified_dt DATE)"
    ]
  };

  version2 = {
    versionNumber: 2,
    queries: [
      "CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT, parent_id INTEGER, order_no INTEGER, created_dt DATE, modified_dt DATE)",
      "CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT, middle_name TEXT, last_name TEXT, parent_id INTEGER, order_no INTEGER,  created_dt DATE, modified_dt DATE)"
    ]
  };

  version3 = {
    versionNumber: 3,
    queries: [
      "INSERT INTO status (title, abbreviation, color, created_dt) VALUES('To Do', 'To Do'," + "'#0644EE', '" + new Date() + "');",
      "INSERT INTO status (title, abbreviation, color, created_dt) VALUES('In Process', 'In Pro', " + "'#460285', '" + new Date() + "');",
      "INSERT INTO status (title, abbreviation, color, created_dt) VALUES('Review', 'Rev', " + "'#FF7400', '" + new Date() + "');",
      "INSERT INTO status (title, abbreviation, color, created_dt) VALUES('Final Review', 'F Rev', " + "'#1CA49A', '" + new Date() + "');",
      "INSERT INTO status (title, abbreviation, color, created_dt) VALUES('Done', 'Done', " + "'#00F240', '" + new Date() + "');"
    ]
  };

  versions = [];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
            private appData : AppData, private sqlite: SQLite) {

    this.versions.push(this.version1);
    this.versions.push(this.version2);
    this.versions.push(this.version3);

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Requests', component: RequestsPage },
      { title: 'Groups', component: GroupsPage }
    ];

    this.initializeApp();

  }

    initializeApp() {
        let me = this;
    this.platform.ready().then(() => {
      //Create the version table
      this.callDatabaseMigrations()
      .then(function() {
        console.log("finished database migrations");
          // this.rootPage = RequestsPage;
      })
      .catch(function(error) {
          console.error(JSON.stringify(error));
          me.rootPage = RequestsPage;
      });
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  callDatabaseMigrations() : Promise<void> {
    return this.createVersionHistoryTable()
      .then(function() {
      });
  }


  //Create the version table
  createVersionHistoryTable() : Promise<void> {
    var query = "CREATE TABLE IF NOT EXISTS version_history(versionNumber INTEGER PRIMARY KEY NOT NULL, migratedAt DATE)";
    let promise = this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;
      db.executeSql(query, []).then(res => {
        var versionNumber = 0;
        this.currentVersion = 0;
        return this.selectCurrentVersion().then(res => {
        });
      }).catch(exception => alert(exception));
    });
    return promise;
  }

  //Get the current version
  selectCurrentVersion() : Promise<void>{
    let me = this;
    let db = me.db;
    var query = "SELECT MAX(versionNumber) AS maxVersion FROM version_history";
    var promise = db.executeSql(query, [])
      .then(function(res) {
        var maxVersion = res.rows.item(0).maxVersion;
        if(maxVersion === undefined)
          maxVersion = 0;
        else
        {
          if(maxVersion == me.latestVersion)
            return me.appData.insertStatuses(db).then(res => {
              return me.rootPage = RequestsPage;
            });
          // me.appData.getAndSetStatuses(db).then(res => {
          //   console.log("got and set statuses")
          //   this.rootPage = RequestsPage;
          // });
        }
        me.versions.forEach(version => {
          if(version.versionNumber > maxVersion)
            console.log("version version nubmer is " + version.versionNumber + " max version is " + maxVersion);
            return me.executeInChain(version.queries, version.versionNumber, db).then(res => {
              //Store each version in the version table
              return me.storeVersionInHistoryTable(version.versionNumber, db);
            });
        });
        return maxVersion;
    });
    return promise;
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    console.log("page is " + page.component);
    this.nav.setRoot(page.component);
  }

  //Execute all queries in version
  executeInChain(queries, versionNumber, db) : Promise<void> {
    console.log("got to execute in chain");
    let me = this;
    var promise = queries.reduce((promise, query) => {
      return promise.then(function() {
        console.log("query is " + query);
        return db.executeSql(query, []).then(res => {
        });
      });
    }, Promise.resolve());
    return promise;
  }

  //Store the version in the history table
  storeVersionInHistoryTable(versionNumber, db) : Promise<void> {
    let me = this;
    var query = "INSERT INTO version_history (versionNumber, migratedAt) VALUES (?, ?)";
    var promise = db.executeSql(query, [versionNumber, new Date()])
      .then(function(res) {
        if(versionNumber = me.latestVersion)
          console.log("version number is " + versionNumber + " latest version is " + me.latestVersion);
          me.appData.insertStatuses(me.db).then( res => {
            me.rootPage = RequestsPage;
          });
        return versionNumber;
      });
    return promise;
  }
}
