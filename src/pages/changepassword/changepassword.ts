import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'page-changepassword',
  templateUrl: 'changepassword.html'
})
export class ChangepasswordPage {
  oldPassword : string;
  newPassword : string;
  confirmPassword: string;
  matched :  boolean = false;
  passwordIncorrect : boolean = false;
  constructor(
    public navCtrl: NavController, 
    public ajax : AjaxService, 
    public database : DatabaseService, 
    public toastCtrl: ToastController,
    private profile : ProfileService) {}

  onChangeNew(event) {
    this.newPassword = event;
    this.verifyPasswords();
  }

  onChange(event) {
    this.confirmPassword = event;
    this.verifyPasswords();
  }

  verifyPasswords() : void {
    if(this.newPassword == this.confirmPassword) {
      this.matched = true;
    } else {
      this.matched = false;
    }
  }

  submit() {
    this.ajax.put(`users/${this.profile.getId()}/set-password/`, {old_password: this.oldPassword, new_password : this.newPassword}).then((res) => {
      this.passwordIncorrect = false;
      this.database.update('Profile', {jwt: res.data.token}, 'id = ?', [String(this.profile.getId())]).then((res) => {});
      this.presentToast();
      this.navCtrl.pop();
    }).catch((error) => {
      this.oldPassword = "";
      this.passwordIncorrect = true;
    })
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: "Password changed successfully",
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
