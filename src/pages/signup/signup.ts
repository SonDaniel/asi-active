import { Component } from '@angular/core';
import { RequestMethod } from '@angular/http';
import { NavController, ViewController } from 'ionic-angular';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';
import { Observable } from 'rxjs/Rx';
import { Camera, File, Transfer, FilePath } from 'ionic-native';
/*
 Generated class for the Signup page.
 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
*/
declare var cordova: any;

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  public username: string;
  public firstname: string;
  public lastname: string;
  public sid: string;
  public email: string;
  public password: string;
  public confirm_password: string;
  public gender: string;
  public major: string;
  public dept: string;
  public dob: string;
  private imageSrc: string;
  dataView: Array<Object>;

  public passwordFlagLength: boolean;
  public passwordFlagNumber: boolean;
  public passwordFlagAlphabet: boolean;
  public confirmPasswordFlag: boolean;
  public usernameFlag: string;
  public emailFlag: string;
  public sidFlag: string;
  public avalibilityFlags: any;


  public frontEndError: any;
  public errorMessage: any;
  public result: any;

  constructor(public navCtrl: NavController, private ajax: AjaxService, private db: DatabaseService, private profile: ProfileService) {

    this.frontEndError = [''];
    this.imageSrc = '';
    this.passwordFlagLength = true;
    this.passwordFlagNumber = true;
    this.passwordFlagAlphabet = true;
    this.usernameFlag = '';
    this.emailFlag = '';
    this.sidFlag = '';
    this.avalibilityFlags = {
      'username': 'NONE',
      'id': 'NONE',
      'email': 'NONE',
    };
    this.confirmPasswordFlag = false;
  }

  ionViewDidLoad() {
  }

  passwordValidation(input: string) {
    this.password = input;
    this.passwordFlagLength = true;
    this.passwordFlagNumber = true;
    this.passwordFlagAlphabet = true;
    console.log(this.password);
    if (this.password != undefined) {
      //console.log(this.password);  
      if (this.password.length >= 8) {
        this.passwordFlagLength = false;
        //console.log(this.passwordFlag);
      }
      if (this.password.match(/[0-9]/)) {
        this.passwordFlagNumber = false;
      }
      if (this.password.match(/[aA-zZ]/)) {
        this.passwordFlagAlphabet = false;
      }
    }

  }

  checkValidAndAvailable(input: string, identifier: string) {
    if (identifier == 'email') {
      let emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailReg.test(this.email)) {
        this.avalibilityFlags[identifier] = 'INVALID';
      }
      return;
    }
    let data = {};
    if (input) {
      data[identifier] = input;
      console.log(input);
      this.avalibilityFlags[identifier] = 'WAIT';
      this.ajax.check(data).subscribe(result => {
        this.avalibilityFlags[identifier] = 'AVAILABLE';

      }, error => {
        this.avalibilityFlags[identifier] = 'NOTAVAILABLE';
      })
    }

  }

  checkConfirmPassword() {
    this.confirmPasswordFlag = false;
    if (this.password != this.confirm_password) {
      this.confirmPasswordFlag = true;
    }
  }

  signup() {
    let signupData = {
      user: {
        username: this.username,
        first_name: this.firstname,
        last_name: this.lastname,
        email: this.email,
        password: this.password
      },
      id: this.sid,
      gender: this.gender,
      dept: this.dept,
      dob: this.dob
    };

    this.frontEndError = [''];

    if (!this.username || !this.firstname || !this.lastname || !this.sid || !this.password || !this.confirm_password || !this.email) {
      this.frontEndError.push('Fields With * Can Not Be Blank');
      return;
    }

    this.ajax.post("register/", signupData, false).then(res => {
      let data = res.data;
      if (this.imageSrc) {
        data['avatar'] = this.imageSrc;
      }      
      this.db.insert('Profile', data).then(() => {
        this.profile.initProfile().then(() => {
          if (this.imageSrc) {
            this.ajax.uploadAvatar(this.imageSrc).then((res) => {
              this.db.update('Profile', {'avatar': res['location']}, 'id=?', [String(this.profile.getId())]);
            });
          }          
        });
      });
    });
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
      this.imageSrc = imageData;
    }, (err) => {
      console.error(JSON.stringify(err));
    });
  }
}