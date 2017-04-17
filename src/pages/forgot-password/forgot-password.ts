import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';
import { LoginPage } from '../login/login';
import {Observable} from 'rxjs/Rx';

@Component({
  selector: 'forgot-password',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {
  public email: string;
  public frontEndError : any;
  public errorMessage  : any;
  public successMessage : string;
  public pin: string;
  public password: string;
  public confirm_password: string;
  public password_flags: any;
  dataView : Array<Object>;

  constructor(
    public navCtrl: NavController, 
    private ajax: AjaxService, 
    private database: DatabaseService,
    private profile : ProfileService) {
  	this.dataView = [
      
      { title : "Email*", bindTo : "email", type : "email", flag: true},
      { title : "PIN*", bindTo : "pin", type : "text", flag: false},
      { title : "Password*", bindTo : "password", type : "password", flag: false},
      { title : "Confirm Password*", bindTo : "confirm_password", type : "password", flag: false}
    ];
    this.frontEndError = [''];
    this.errorMessage='';
    this.password_flags=[true,true,true,true];
  }

  ionViewDidLoad() {
    Observable.interval(1000).subscribe( ()=>{
      this.password_flags = [true,true,true,true];
      if(this.password!=undefined){
        //console.log(this.password);  
        if(this.password.length>=8){
            this.password_flags[0] = false;
            //console.log(this.password_flags);
        }
        if(this.password.match(/[0-9]/)){
            this.password_flags[1]= false;
        }
        if(this.password.match(/[aA-zZ]/)){
            this.password_flags[2]= false;
        }
      }
      

    });
  }
  emailSend(){
    this.frontEndError = [''];
    let errorFlag = true;

  	let emailData = {
  		email: this.email,
  	}

    let emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(!this.email){
    	errorFlag = false;
      this.frontEndError.push('Email Field Can Not Be Blank');
    }
    if(!emailReg.test(this.email)){
      errorFlag = false;
      this.frontEndError.push('Email Is Invalid');
    }
    if(errorFlag){
       this.dataView[0]['flag'] = false;
       this.dataView[1]['flag'] = true;
       
       this.ajax.post('request-password-reset/',emailData, false).then((res) => {}).catch((err) => {
        this.errorMessage = err;
      });
      this.successMessage = 'Please Check your Email For Further Details';

    }
  }

  pinVerify(){
    this.frontEndError = [''];
    let errorFlag = true;
    this.errorMessage = '';

    let pinVerifyData = {
      email: this.email,
      code: this.pin
    }
    console.log(JSON.stringify(pinVerifyData));
    if(!this.pin){
      errorFlag = false;
      this.frontEndError.push('PIN Field Can Not Be Blank');
    }
    if(errorFlag){
      this.ajax.post('verify-code/', pinVerifyData, false).then((res) => {
        this.dataView[0]['flag'] = false;
        this.dataView[1]['flag'] = false;
        this.dataView[2]['flag'] = true;
        this.dataView[3]['flag'] = true;
      }).catch((err) => {
        console.log(this.errorMessage = JSON.stringify(err));
        if(this.errorMessage.toLowerCase().includes("expired")){
          this.frontEndError.push('Your PIN has expired please start over the process');
          this.successMessage = '';
        }
      });
    }
  }

  passwordVerify(){
    this.frontEndError = [''];
    let errorFlag = true;
    this.errorMessage = '';

    let passwordData = {
      email: this.email,
      code: this.pin,
      password: this.password
    }
    if(!this.password || !this.confirm_password){
      errorFlag = false;
      this.frontEndError.push('Fields Can Not Be Blank');
    }
    if(this.password != this.confirm_password){
      errorFlag = false;
      this.frontEndError.push('Password and Confirm Password Are Not Same');
    }
    if(errorFlag){
      this.ajax.post('change-password/', passwordData, false).then((res) => {
        this.navCtrl.setRoot(LoginPage);
      }).catch((err) => {
        console.log(this.errorMessage = JSON.stringify(err));
      });
    }
  }

  

  getProp(prop) {
    return this[prop];
  }

  setProp(prop, value) {
    this[prop] = value;
  }
}
