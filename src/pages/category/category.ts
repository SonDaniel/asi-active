import { Component } from '@angular/core';
import { Keyboard, YoutubeVideoPlayer } from 'ionic-native';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';
import { DetailsPage } from '../details/details';

import moment from 'moment/src/moment';

@Component({
  selector: 'page-category',
  templateUrl: 'category.html'
})
export class CategoryPage {
	categories : Array<any>;
	location : number;
  title : string;
	myInput: string = "";
  allData : Array<any>;
  searchInput: string = "";
  search: boolean;
  customFlag: boolean = false;
  customData : Array<any> = [];
  customDataLength : any;
  totalPointsToday : number;
  disabled : boolean = false;
  customVideo : any;
  videoBackground : string;
  eventsFlag : boolean = false;
  eventData : any;
  message : boolean = false;
  edit : boolean;
  editText : string;
  editList : any;
  eventLength : number;

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

  constructor(
    public navCtrl: NavController,
    public params: NavParams,
    public alertCtrl: AlertController,
    public ajax: AjaxService,
    public db: DatabaseService,
    public profile : ProfileService
    ) {}

  ionViewWillEnter() {
    this.edit = false;
    this.editList = [];
    this.editText = "edit";
    this.search = false;
    this.title = this.params.get('sectionName');

    switch(this.title.toUpperCase()) {
      case 'CUSTOM' : {
        this.customFlag = true;
        this.getCustomActivities().then(() => {});
        this.db.rawQuery(`
          SELECT datetime
          FROM Profile inner join ActivityLog
          ON Profile.id = ActivityLog.profile_id
          WHERE
            Date(datetime) = Date('now')
            AND 
            category_id = 1
            and Profile.id = ${this.profile.getId()};
        `).then((res) => {
          if(res.length >= 3) {
            this.disabled = true;
          }
        });
        break;
      }
      case 'EVENTS' : {
        this.eventsFlag = true;
        this.db.query('Event', undefined, "active = ? and end >= datetime('now')",['true']).then((res) => {
          this.eventData = this.extractData(res);
          this.eventLength = res.length;
        });
        break;
      }
      default : {
        this.db.query('Category', undefined, 'section_id = ?', [this.params.get('sectionId')]).then((res) => {
          this.categories = [];
          for(let x = 0; x < res.length; x++ ) {
            this.categories.push(res.item(x));
          }
        });
      }
    }

    this.profile.getDailyPoints().then((res) => {
      this.totalPointsToday = res;
      if(this.totalPointsToday + 1 > 16) {
        this.disabled = true;
        this.message = true;
      }
    });

    this.ajax.get('sections/custom/').then((res) => {
      this.customVideo = res.data.video_id;
      this.videoBackground = res.data.video_bg;
    });
  }

  ionViewWillLeave() {
    this.search = false;
    this.searchInput = "";
    this.allData = [];
  }

  private getCustomActivities() : Promise<any> {
    return this.db.query('CustomActivity', undefined, 'profile_id = ?', [String(this.profile.getId())]).then((res) => {
      this.customDataLength = res.length;
      this.customData = this.extractData(res);
    });
  }

  private extractData(res : any) : any {
    let temp = [];
    for(let x = 0; x < res.length; x++) {
      temp.push(res.item(x));
    }

    return temp;
  }

  editButton(edit, editList) {
    if(edit) { //save button was clicked
      this.db.bulkDelete('CustomActivity','id = ?', editList).then((res) => {
        this.cancelEdit();
      });
    } else { //edit button was clicked.
      this.edit = true;
      this.editText = "save";
    }
  }

  cancelEdit() {
    this.editList = []; //empty list that held delete data
    this.getCustomActivities().then(() => {});
    this.edit = false;
    this.editText = "edit";
  }

  queueDeleteActivity(id) {
    this.editList.push(String(id));
    console.log(JSON.stringify(this.editList));
    var index = -1;
    for(let ii = 0 ; ii < this.customData.length; ii++){
      if(id == this.customData[ii]["id"]) {
        index = ii;
      }
    }
    this.customData.splice(index, 1);
  }

  tapForEvents(obj : any) {
    this.navCtrl.push(DetailsPage, {
      sectionName : this.title,
      eventData : obj
    });
  }

  tapEvent(id, name : string, pts : string, description: string) {
    this.navCtrl.push(DetailsPage, {
      sectionName : this.title,
      locationName : name,
      location : id,
      points : pts,
      description: description
    });
  }

  shouldShowCancel(event) {

  }

  onCancel(event) {
    this.search = false;
  }

  focused(event) {
    this.search = true;
  }

  unfocused(event) {
    Keyboard.close();
  }
  
  check() : any {
    if(this.searchInput === "") {
      this.search = false;
      return;
    } else {
      return;
    }
  }

  public getImage(section : any) : any {
    return "assets/img/" + section.toLowerCase() + "_bg.png";
  }

  getPoints(points : any) : any {
    if(points === 1 )
      return  points + " PT";
    else
      return points + " PTS";
  }

  getColor(section : any) : any {
    if(section === "ASI")
      return "#F9CB0B";
    else if (section === "OFF-CAMPUS")
      return "#4FC3F7";
    else if (section === "CUSTOM")
      return "#16D9CB";
    else
      return "#FF7043";
  }

  changeView(data : any) {
    this.navCtrl.push(DetailsPage, {
      sectionName: data.section,
      locationName : data.category,
      location : data.category_id,
      points : data.points,
      description: data.description
    });
  }

  getClass(section : any) : any {
    if(section === "ASI")
      return "ASI-Yellow"
    else if(section === "OFF-CAMPUS")
      return "ASI-Blue"
    else if (section === "CUSTOM")
      return "ASI-Teal"
    else 
      return "ASI-Red"
  }

  videoTutorial() {
    YoutubeVideoPlayer.openVideo(this.customVideo);
  }

  addCustom() {
    let prompt = this.alertCtrl.create({
      title: 'Add New Custom Activity',
      message: "Enter a name for your custom activity",
      inputs: [
        {
          name: 'name',
          placeholder: 'name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            //do nothing
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.db.query('Category', ['id'], 'name = ?', ['UNCATEGORIZED']).then((res) =>{
              if(res.length) {
                this.db.insert('CustomActivity',{
                  name : data.name,
                  category_id : res.item(0).id,
                  profile_id : this.profile.getId()
                }).then((res) => {
                  this.getCustomActivities().then(() => {});
                  console.log(`Successfully inserted ${data.name} into CustomActivity.`);
                }); // TO DO: When unique constraint fails when inserting, highlight in the list
              }
            });
          }
        }
      ]
    });
    prompt.present();
  }

  logCustomActivity() {
    this.disabled = true;
    let date = new Date();
    let category_id = this.customData[0].category_id;
    this.db.insert('ActivityLog', {
      profile_id : this.profile.getId(),
      category_id : category_id,
    }).then((res) => {
      this.ajax.post('activity-logs/', {
        category_id : category_id,
        datetime: moment(date).format('YYYY-MM-DD HH:m:ss')
      }).then((res) => {
        console.log(moment.utc(date).format('YYYY-MM-DD HH:m:ss'));
        this.db.update('ActivityLog', {"synced" : 1}, 'profile_id = ? and category_id = ? and datetime = ?',
          [String(this.profile.getId()), category_id, moment.utc(date).format('YYYY-MM-DD HH:m:ss')]).then((res) => {
            console.log('Successfully uploaded to server.');
          });
      });
    });

    //Setting up alert
    let alert = this.alertCtrl.create({
      title: 'You gained 1 point!',
      subTitle: this.achievement(),
      buttons: [{
        text: 'OK'
      }]
    });
    alert.present();
  }

  private achievement() : string {
    return this.listQuotes[Math.floor((Math.random() * 14) + 1)];
  }

  filterSearch(event: any) {
  // this.database.getAllData();
  // this.database.events.subscribe('getAll', (object) => {
  //   this.allData = object;
  //   let val = event.target.value;
  //   if(val && val.trim() != '') {
  //     this.allData = this.allData.filter((data) => {
  //       if(data.activity === null) {
  //         return (data.section.toLowerCase().indexOf(val.toLowerCase()) > -1 || data.category.toLowerCase().indexOf(val.toLowerCase()) > -1 )
  //       } else {
  //         return(data.activity.toLowerCase().indexOf(val.toLowerCase()) > -1 )
  //         // Delete code below if code above suffice
  //         // return(data.section.toLowerCase().indexOf(val.toLowerCase()) > -1 || data.category.toLowerCase().indexOf(val.toLowerCase()) > -1 || data.activity.toLowerCase().indexOf(val.toLowerCase()) > -1 )
  //       }
  //     });
  //   }
  // });

}

}
