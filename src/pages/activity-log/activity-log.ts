import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';
import moment from 'moment/src/moment';

@Component({
  selector: 'page-activity-log',
  templateUrl: 'activity-log.html'
})
export class ActivityLogPage {
	logs : Array<any>;
  logLength : number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private db : DatabaseService,
    private profile : ProfileService) {}

  ionViewWillEnter() {
    this.db.rawQuery(`
      SELECT * 
      FROM 
        (
          SELECT ActivityLog.profile_id, Category.name as name, Category.points as points, Section.name as section, ActivityLog.datetime as time, ActivityLog.synced
          FROM Profile inner join ActivityLog
          ON ActivityLog.profile_id = Profile.id inner join Category
          ON ActivityLog.category_id = Category.id inner join Section 
          ON Category.section_id = Section.id
          WHERE Profile.id = ${this.profile.getId()} 
          UNION ALL 
          SELECT EventLog.profile_id, Event.name as name, Event.points as points, 'EVENTS' as section, EventLog.datetime as time, EventLog.synced 
          FROM Profile inner join EventLog
          ON Eventlog.profile_id = Profile.id inner join Event
          ON Eventlog.event_id = Event.id
          WHERE  Profile.id = ${this.profile.getId()}
          ) log 
          ORDER BY datetime(time) DESC;
    `).then((res) => {
      this.logs = [];
      this.logLength = res.length;
      if(res.length) {
        for(let x = 0; x < res.length; x++ ) {
          this.logs.push(res.item(x));
        }
      }
    });
  }

  getCategory(category : any) : string {
  	if(category === "UNCATEGORIZED") {
  		return "CUSTOM";
  	} else {
  		return category;
  	}
  }
  
  getPoints(points : any) : string {
  	if(points === 1)
  		return points + " PT";
  	else
  		return points + " PTS";
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

  getDate(date : any) : string {
    return moment(date).format('ll');
  }

  getHourMins(date: any) : string {
    return moment(date).format('LT');
  }
}
