import { Component } from '@angular/core';
import { NavParams, ViewController, Platform, ToastController } from 'ionic-angular';
import { Camera, Transfer } from 'ionic-native';

import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

@Component({
	selector: "edit-profile",
	templateUrl: "edit-profile.html"
})
export class EditProfile {
	public user : any;
  public avatar : string;

	constructor(
    public platform: Platform, 
    public params: NavParams, 
    public viewCtrl : ViewController, 
    public toastCtrl: ToastController,
    public ajaxUtil: AjaxService, 
    public db: DatabaseService,
    private profile : ProfileService) {
      this.user = this.profile.getProfile();
    }

	ionViewWillEnter() {
    this.avatar = this.profile.getAvatarUrl();
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  private openGallery(): void {
    let cameraOptions = {
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.FILE_URI,      
      quality: 95,
      targetWidth: 250,
      targetHeight: 250,
      encodingType: Camera.EncodingType.JPEG,      
      correctOrientation: true
    }

    Camera.getPicture(cameraOptions).then((imageData) => { 
        this.avatar = imageData;
      }, (err) => {});   
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {
    console.log(JSON.stringify(this.user));
    this.ajaxUtil.put(`users/${this.profile.getId()}/`, this.user).then((res) => {
      this.db.update('Profile',
      {
        username: this.user.user.username,
        first_name: this.user.user.first_name,
        last_name: this.user.user.last_name,
        email: this.user.user.email,
        sid: this.user.id,
        gender: this.user.gender,
        dept: this.user.dept,
        dob: this.user.dob,
        avatar: this.avatar
      }, 'id = ?', [String(this.profile.getId())]).then((res) => {
        this.profile.initProfile();
      });
      if(!(this.avatar == this.profile.getAvatarUrl())) {
        console.log('hit');
        this.ajaxUtil.uploadAvatar(this.avatar).then((res) => {
          console.log('http://127.0.0.1:8000' + res.location); //REMOVE THIS ON PROD AND THE STRING CONCAT BELOW
          this.db.update('Profile', {avatar : 'http://127.0.0.1:8000' + res.location}, 'id = ?', [String(this.profile.getId())]).then((res) => {
            this.profile.initProfile();
          });
        }).catch((err) => {
          console.log(JSON.stringify(err));
        });
      }
      this.viewCtrl.dismiss();
    });
    // this.ajaxUtil.call("PUT", "users/" + this.userObject.user_id + "/", this.database.getJwt(), data).subscribe((result) => {
    //   console.log(JSON.stringify(result));
    //   this.database.updateUser(result.json());
    //   this.database.events.subscribe('updateUser', () => {
    //     if(!(this.imageSrc == "assets/img/signup-photo.svg" || this.imageSrc == this.userObject.avatar)) {
    //       console.log('reached')
    //       var url = "http://asicsulb.org/apps/api/users/" + this.userObject.user_id + "/change-avatar/";
    //       var token_value = "JWT "+ result.json().token;
    //       var options = {
    //         fileKey: "file",
    //         chunkedMode: false,
    //         mimeType: "*/*",
    //         httpMethod: "PUT",
    //         headers:{
    //           "Content-Type": "application/json",
    //           "Authorization" : token_value,
    //           "Content-Disposition": "attachment; filename=avatar.jpg",
    //         },
    //       };
         
    //      console.log(this.imageSrc);
    //       const fileTransfer = new Transfer();
         
    //       // Use the FileTransfer to upload the image
    //       fileTransfer.upload(this.imageSrc, encodeURI(url), options).then((data) => {
    //         this.database.saveAvatar(data.headers, this.userObject.user_id);
    //         this.presentToast('Image succesful uploaded.');
    //         this.viewCtrl.dismiss(true);
    //       }, err => {
    //         this.presentToast('Error while uploading file. Try Again');
    //         console.error("error while uploading", JSON.stringify(err));
    //       });
    //     } else {
    //       this.viewCtrl.dismiss(true);
    //     }
    //   });
    // }, (error) => {
    //   console.error("api error in edit profile:", JSON.stringify(error));
    // })
  }

}