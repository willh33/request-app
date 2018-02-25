import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
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
  db: any;
  currentVersion;
  statuses = [];
  latestVersion = 1;

  //Create all the versions
  version1 = {
    versionNumber: 1,
    queries: [
      "CREATE TABLE IF NOT EXISTS status (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, color TEXT, createddt TEXT, modifieddt TEXT)",
      "CREATE TABLE IF NOT EXISTS request (rowid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status INTEGER, orderno, createddt TEXT, modifieddt TEXT)"
      // "INSERT INTO status (title, color, createddt) VALUES('To Do', " + "'#e13838', '" + new Date() + "')",
      // "INSERT INTO status (title, color, createddt) VALUES('In Process', " + "'#e13838', '" + new Date() + "')",
      // "INSERT INTO status (title, color, createddt) VALUES('Review', " + "'#e13838', '" + new Date() + "')",
      // "INSERT INTO status (title, color, createddt) VALUES('Final Review', " + "'#e13838', '" + new Date() + "')",
      // "INSERT INTO status (title, color, createddt) VALUES('Done', " + "'#e13838', '" + new Date() + "')"
    ]
  };

  versions = [];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
            private appData : AppData, private sqlite: SQLite) {

    this.versions.push(this.version1);

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Requests', component: RequestsPage },
      { title: 'Groups', component: GroupsPage }
    ];

    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      //Create the version table
      this.callDatabaseMigrations()
      .then(function() {
          // this.rootPage = RequestsPage;
      })
      .catch(function(error) {
        console.error(JSON.stringify(error));
      });
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  callDatabaseMigrations() : Promise<void> {
    console.log("calling database migrations");
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
            return me.executeInChain(version.queries, version.versionNumber, db).then(res => {
              // if(version.versionNumber == 1)
              //   me.appData.getAndSetStatuses(db);
              console.log("executed all queries");
              //Store each version in the version table
            });
        });
        return maxVersion;
    });
    return promise;
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  //Execute all queries in version
  executeInChain(queries, versionNumber, db) : Promise<void> {
    let me = this;
    console.log("execute all queries");
    var promise = queries.reduce((promise, query) => {
      console.log("query " + query);
      console.log("promise " + promise);
      return promise.then(function() {
        return db.executeSql(query, []).then(res => {
          console.log("executed query " + query);
        });
      });
    }, Promise.resolve());
    return promise.then(res => {
      return me.storeVersionInHistoryTable(versionNumber, db);
    });
  }

  //Store the version in the history table
  storeVersionInHistoryTable(versionNumber, db) : Promise<void> {
    let me = this;
    console.log("store the version in hisotry table");
    var query = "INSERT INTO version_history (versionNumber, migratedAt) VALUES (?, ?)";
    var promise = db.executeSql(query, [versionNumber, new Date()])
      .then(function(res) {
        if(versionNumber = me.latestVersion)
          me.appData.insertStatuses(me.db).then( res => {
            me.rootPage = RequestsPage;
          });
        console.log("Stored version in history table: " + versionNumber);
        return versionNumber;
      });
    return promise;
  }
}
