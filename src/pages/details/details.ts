import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

import { DomSanitizer } from '@angular/platform-browser';

import moment from 'moment/src/moment';

@Component({
  selector: 'page-details',
  templateUrl: 'details.html'
})
export class DetailsPage {
	dataObject : Array<any> = [];
	locationName : string;
	points: number;
  category_id : string;
	description : string;
  title : string;
  totalPointsToday : number;
  poster : string;
  eventDisabled : boolean = false;
  eventData : any;
  start : any;
  end : any;
  events: boolean = false;
  disabled : boolean = false;
  message: boolean = false;

  eventQuotes : any = [
    "",
    "Thanks for coming out!",
    "Thanks for participating!",
    "Thanks for your support!"
  ];

  listQuotes : any = [
    "",
    "You're killing it!",
    "Keep it up!",
    "Smashing job!",
    "You’re awesome!",
    "You got this!",
    "Onto the next challenge!",
    "Kudos to you!",
    "Way to go!",
    "You’re almost there!",
    "High-Five!",
    "Keep going!",
    "Now take a break!",
    "Don’t forget to hydrate!",
    "Time to grub!"
  ];
  
  constructor(public navCtrl: NavController,
    public params: NavParams, 
    public ajax: AjaxService, 
    public db: DatabaseService,
    public alertCtrl: AlertController,
    public profile : ProfileService,
    public sanitizer : DomSanitizer) {
      this.title = this.params.get('sectionName');
      switch(this.title.toUpperCase()) {
        case 'EVENTS' : {
          this.events = true;
          this.eventData = this.params.get('eventData');
          this.points = this.eventData.points;
          this.start = new moment(this.eventData.start).format('llll');
          this.end = new moment(this.eventData.end).format('llll');
          break;
        }
        default : {
          this.locationName = this.params.get('locationName');
          this.points = this.params.get('points');
          this.description = this.params.get('description');
          this.category_id = this.params.get('location');
        }
      }
    }

  ionViewWillEnter() {
    switch(this.title) {
      case 'EVENTS' : {
        this.db.query('EventLog', undefined, 'event_id = ?', [this.eventData.id]).then((res) => {
          if(res.length >= 1) {
            this.eventDisabled = true;
          }
        });
        let today = new Date();
        if(today < new Date(this.eventData.start)) {
          this.eventDisabled = true;
        }
      }
      default : {
        this.db.query('Activity', undefined, 'category_id = ?', [this.category_id]).then((res) => {
          for(let x = 0; x < res.length; x++) {
            this.dataObject.push(res.item(x));
          }
        });
      }
    }

    this.profile.getDailyPoints().then((points) => {
      this.totalPointsToday = points;
      if(this.totalPointsToday + this.points > 16) {
        this.disabled = true;
        this.message = true;
      }
    });
  }


  logEvent(id : any) {
    this.eventDisabled = true;
    let date = new Date();

    this.db.insert('EventLog', {
      event_id : id,
      profile_id : this.profile.getId()
    }).then((res) => {});
    
    this.ajax.post('event-logs/', {
      event_id : id,
      datetime : moment.utc(date)
    }).then((res) => {
      this.db.update('EventLog', {synced : 1}, 'profile_id = ? and event_id = ? and datetime = ?',
      [String(this.profile.getId()), id, moment.utc(date).format('YYYY-MM-DD HH:m:ss')]).then((res) => {
        console.log('Successfully uploaded to server.');
      });
    });

    this.alertUser();    
  }

  logActivity() {
    this.disabled = true;
    let date = new Date();
    this.db.insert('ActivityLog', {
      category_id : this.category_id,
      profile_id : this.profile.getId()
    }).then((res) => {});

    this.ajax.post('activity-logs/', {
      category_id : this.category_id,
      datetime : moment.utc(date)
    }).then((res) => {
      this.db.update('ActivityLog', {synced : 1}, 'profile_id = ? and category_id = ? and datetime = ?',
      [String(this.profile.getId()), this.category_id, moment.utc(date).format('YYYY-MM-DD HH:m:ss')]).then((res) => {
        console.log('Successfully uploaded to server.');
      });
    });

    this.alertUser();
  }

  getColor() : string {
    switch(this.title) {
      case "ASI":
        return "ASI-Yellow";
      case "OFF-CAMPUS":
        return "ASI-Blue";
      case "EVENTS":
        return "ASI-Red";
      case "CUSTOM":
        return "ASI-Teal";
      default:
        return "";
    }
  }

  getPoints(points : any) : any { 
    if(points === 1)
      return points + "PT";
    else
      return points + "PTS";
  }

  getBackground() : string {
      let locname = this.locationName.split(" ");
      var finalLocation = locname[0].toLowerCase();
      return "url('assets/img/details/" + this.title + "_" + finalLocation + ".jpg')";
  }

  public alertUser() {
      //Setting up alert
      let alert = this.alertCtrl.create({
        title: 'You gained ' + this.points  + ' points!',
        subTitle: this.achievement(),
        buttons: [{
          text: 'OK'
        }]
      });
      alert.present();
  }

  private achievement() : string {
    if(this.title.toUpperCase() === "EVENTS") {
      return this.eventQuotes[Math.floor((Math.random() * 3) + 1)]
    } else {
      return this.listQuotes[Math.floor((Math.random() * 14) + 1)];
    }	
  }
}
