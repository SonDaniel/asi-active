import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

import moment from 'moment/src/moment';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})
export class FeedbackPage {
	message: string;
	dataView : Object;
  disable : boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private ajax: AjaxService, 
    private database: DatabaseService, 
    private toastCtrl: ToastController,
    private profile : ProfileService) {}

  sendFeedback(){
  	if(this.message) {
      this.disable = true;
      this.ajax.post('feedback/', {message : this.message, datetime: moment.utc()}).then((res) => {
        this.presentToast("Feedback recieved. Thank You!");
      }).catch((error) => this.presentToast(error));
  	} else {
  		this.presentToast('You Can Not Send Empty Message');
  	}
  }
  
  presentToast(message : any) {
  		let toast = this.toastCtrl.create({
	  		message: message,
	  		duration: 3000,
	  		position: 'top'
	  	});
	  	toast.onDidDismiss(() => {});

	  	toast.present();
  }
}
