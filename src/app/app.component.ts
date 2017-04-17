import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

import { ProfileService } from '../services/profile.service';
import { DatabaseService } from '../services/database.service';
import { AjaxService } from '../services/ajax.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform, private profile: ProfileService, private db : DatabaseService, private ajax : AjaxService) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
      setTimeout(() => {
        this.db.open().then(() => {
          // Check if database schema is current
          this.db.upgradeCheck().then(() => {
            // Check if database has been initialized with data
            this.db.query('Setting', ['value'], 'key = ?', ['db_init']).then((res) => {
              if(res.item(0).value == 0) { // If false
                // Initialize database
                this.ajax.get('initialize/', false).then((res) => {
                  Promise.all([
                    this.db.setUp(res.data.results).then(res => console.log('Database was successfully initialized. ' + res)),
                    this.db.update('Setting', {'value': 1}, "key = ?", ['db_init']).then(() => console.log('db_init has been set successfully to "true"'))
                  ]);
                });
              }
            });

            this.profile.initProfile().then(() => {
              Splashscreen.hide();
              this.rootPage = TabsPage;
            }).catch(err => {
              console.log('Error: ' + JSON.stringify(err.message) + ' Redirecting user to login screen...');
              this.rootPage = LoginPage;
            });
          });
        }).catch(err => console.log('Error with database: ' + JSON.stringify(err.message)));
      }, 1000);
    });
  }
}
