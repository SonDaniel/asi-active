import { Component } from '@angular/core';
import { NavController, ToastController, NavParams, ActionSheetController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ProfileService } from '../../services/profile.service';
import { FeedbackPage } from '../feedback/feedback';
import { ChangepasswordPage } from '../changepassword/changepassword';
import { ChangeusernamePage } from '../changeusername/changeusername';
import { FaqPage } from '../faq/faq';
import { EditProfile } from '../profile/edit-profile';
import { DatabaseService } from '../../services/database.service';

declare var cordova : any;

@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
	logOut : any;
  appVersion : any;
  constructor(
    private db: DatabaseService,
    private profile : ProfileService,
    public navCtrl: NavController, 
    private toastCtrl: ToastController, 
    public params: NavParams,
    public actionSheetCtrl: ActionSheetController) {
  	this.logOut = params.data;
  }

  ionViewDidLoad() {
    cordova.getAppVersion.getVersionNumber().then((version) => {
      this.appVersion = version;
    });
  }

  presentToast() {
  	let toast = this.toastCtrl.create({
  		message: 'Successfully logged out',
  		duration: 3000,
  		position: 'top'
  	});

  	toast.onDidDismiss(() => {

  	});

  	toast.present();
  }

  editProfile() {
    this.navCtrl.push(EditProfile);
  }

  logout() {
    this.presentActionSheet();
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Log out',
      buttons: [
        {
          text: 'Log out',
          role: 'destructive',
          handler: () => {
            this.db.update('Setting', {'value' : -1}, 'key = ?', ['current_user']).then(() => {
              this.db.update('Profile', {'jwt' : ''}, 'id = ?', [String(this.profile.getId())]).then(() => {
                this.logOut.root.setRoot(LoginPage);
                this.presentToast();
              });
            });
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    actionSheet.present();
  }

  feedback() {
    this.navCtrl.push(FeedbackPage);
  }

  changePassword() {
    this.navCtrl.push(ChangepasswordPage);
  }

  changeUsername() {
    this.navCtrl.push(ChangeusernamePage);
  }

  faq() {
    this.navCtrl.push(FaqPage);
  }
}