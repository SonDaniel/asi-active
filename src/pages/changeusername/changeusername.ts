import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'page-changeusername',
  templateUrl: 'changeusername.html'
})
export class ChangeusernamePage {
  username : string;
  newUsername : string;
  usernameWait: boolean = false;
  usernameUnavailable: boolean;
  usernameAvailable: boolean;
  id : any;
  constructor(
    public navCtrl: NavController, 
    public ajax : AjaxService, 
    public database : DatabaseService, 
    public toastCtrl : ToastController,
    private profile : ProfileService) {}

  ionViewWillLoad() {}

  ionViewWillEnter() {
    this.username = this.profile.getUsername();
  }

  submit() {
    this.ajax.put(`users/${this.profile.getId()}/set-username/`, {username : this.newUsername}).then((res) => {
      console.log(res.data.token);
      this.database.update('Profile', {jwt: res.data.token, username: this.newUsername}, 'id = ?', [String(this.profile.getId())]).then((res) => {
        this.profile.initProfile();
        this.presentToast();
        this.navCtrl.pop();
      });
    });
  }

  validate(username: string) {
    this.usernameWait = true
    console.log(JSON.stringify(this.profile));
    this.ajax.check({username : username}).subscribe((res) => {
      this.usernameWait = false;
      if(res.status != 204) {
        this.usernameAvailable = true;
        this.usernameUnavailable = false;
        return;
      }
    }, (err) => {
      this.usernameWait = false;
      this.usernameAvailable = false;
      this.usernameUnavailable = true;
    });

  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: "Username changed successfully.",
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
