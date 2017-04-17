import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { OnboardPage } from '../onboard/onboard';

import { ProfileService } from '../../services/profile.service';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { SignupPage } from '../signup/signup';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

declare var cordova: any;

@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginPage {
  username: string;
  password: string;
  errorMessage: string;
  appVersion : any;
  loading : any;

  constructor(
    public navCtrl: NavController, 
    public loadingCtrl: LoadingController, 
    private ajax : AjaxService, 
    private db : DatabaseService,
    private profile : ProfileService) {

  }

  ionViewCanEnter() {
    this.username = "";
    this.password = "";
    this.errorMessage = "";
  }

  ionViewDidEnter() {
    cordova.getAppVersion.getVersionNumber().then((version) => {
      this.appVersion = version;
    });
  }

  ionViewDidLeave() {}

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Logging in. Please wait...'
    });
    this.loading.present();
  }

  login() {
    this.presentLoading();
    this.errorMessage = "";
    if (this.username && this.password) {
      let data = {
        username : this.username,
        password : this.password
      };

      //AJAX call to get token
      this.ajax.post('get-token/', data, false).then((res) => {
        let token = res.data.token;
        this.db.query('Profile', ['id'], "username = ?", [data.username]).then((res) => {
          console.log(res.length);
          if(res.length) { //User was found
            this.db.update('Profile', {jwt : token}, "id = ?", [res.item(0).id]).then(() => {
              console.log('hit');
              this.db.update('Setting', {value : res.item(0).id},"key = ?", ["current_user"]).then(() => {
                this.checkFirstTime();
              });
            });
          } else { //User was not found
            this.ajax.get('users/', token).then((res) => {
              let userServerData = res.data.results;
              let userData = {
                id: userServerData[0].user.id,
                username: userServerData[0].user.username,
                first_name: userServerData[0].user.first_name,
                last_name: userServerData[0].user.last_name,
                email: userServerData[0].user.email,
                sid: userServerData[0].id,
                gender: userServerData[0].gender,
                dept: userServerData[0].dept,
                dob: userServerData[0].dob,
                avatar: userServerData[0].avatar,
                jwt : token
              };
            this.db.insert('Profile', userData).then((res) => {
              this.db.bulkInsert('ActivityLog', userServerData[0].categories).then(() => {
                this.db.update('ActivityLog', {synced : 1}, 'profile_id = ?', [userData.id]).then(() => {
                  console.log('Activity Logs aquired and updated.');
                });
              });
              this.db.bulkInsert('EventLog', userServerData[0].events).then(() => {
                this.db.update('EventLog', {synced : 1}, 'profile_id = ?', [userData.id]).then(() => {
                  console.log('Event Logs aquired and updated.')
                });
              });
              this.db.update('Setting', {value : userData.id},"key = ?", ["current_user"]).then(() => {
                this.checkFirstTime();
              });
            });
          });
          }
        })
      }).catch((err) => {
        this.loading.dismiss();
        this.errorMessage = "Credentials do not match.";
      });
    }
  }

  private checkFirstTime() {
    this.profile.initProfile().then((res) => {
      this.db.query('Profile', ['show_onboard'], 'id = ?', [String(this.profile.getId())]).then((res) => {
        if(res.length == 1) {
          if(res.item(0).show_onboard) { //first_time is true
            this.navCtrl.setRoot(OnboardPage);
          } else { //first_time is false
            this.navCtrl.setRoot(TabsPage);
          }
          this.loading.dismiss();
        }
      });
    });
  }

  signup() {
    this.navCtrl.push(SignupPage);
  }
  
  forgotpassword() {
    this.navCtrl.push(ForgotPasswordPage);
  }
}