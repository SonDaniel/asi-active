import { Component } from '@angular/core';

import { NavController, InfiniteScroll } from 'ionic-angular';
import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

// const DOMAIN_URL = 'http://127.0.0.1:8000';

@Component({
  selector: 'page-leaderboard',
  templateUrl: 'leaderboard.html'
})
export class LeaderboardPage {
  test : string = 'inactive';
  Ranks: string = "myRank";
  students: Array<Object> = [];
  errorMessage: string;
  dataExists : boolean = false;
  data : any;
  studentsLength : number;
  dataLength : number;
  constructor(
    public navCtrl: NavController,
    private ajax: AjaxService,
    private database: DatabaseService,
    private profile : ProfileService) {}

  ionViewWillEnter() {
    this.database.query('Cache',['etag'], 'type = ?', ['ranks']).then((res) => {
      this.rankingsReset(res.item(0).etag);
    });
  }

  ionViewDidLeave() {
    this.data = [];
    this.students = [];
  }

public getDepartment(dept: string) : string {
		switch(dept) {
			case "CDC":
				return "Isabel Patterson Child Development Center";
			case "BO":
				return "Business Office";
			case "HR":
				return "Human Resources";
			case "IT":
				return "IT";
			case "GOV":
				return "Student Government";
			case "BPE":
				return "Beach Pride Events";
			case "COM":
				return "ASI Communications";
			case "SM":
				return "Student Media";
			case "FM":
				return "Facilities & Maintenance";
			case "RC":
				return "Recycling Center";
			case "UBM":
				return "USU - Building Managers";
			case "CE":
				return "Conference & Events";
			case "MBP":
				return "Maxson & Beach Pantry";
			case "GCI":
				return "Games, Candy, Info & Ticket Center";
			case "FIT":
				return "SRWC - Fitness";
			case "INT":
				return "SRWC - Intramurals";
			case "AQU":
				return "SRWC - Aquatics";
			case "MB":
				return "SRWC - Membership";
			case "RBB":
				return "SRWC - ROA/Beach Balance";
			case "MA":
				return "SRWC - Membership & Admin";
			case "SBM":
				return "SRWC - Building Managers";
		}
	}

  public rankingsReset(Etag: string){
    this.ajax.get('users/rankings/', true, Etag).then((res) => { //Data has changed
      if(res.data.status) {
        this.dataExists = false;
        this.errorMessage = res.data.status;
      } else {
        this.data = res.data;
        this.dataLength = this.data.length;
        this.pushData();
        this.dataExists = true;
        this.database.update('Cache', {etag : res.headers.get('ETag'), data : JSON.stringify(res.data)}, 'type = ?', ['ranks']).then((res) => {
          console.log('Updated Cache etag and data for ranks.');
        })
      }
    }).catch((err) => { //Catching a 304
      this.database.query('Cache', ['data'], 'type = ?', ['ranks']).then((res) => {
        if(res.length) {
          this.dataExists = true;
          this.data = JSON.parse(res.item(0).data);
          this.dataLength = this.data.length;
          this.pushData();
        }  else { //No Data in Cache and Error in Ajax
          this.errorMessage = "Rankings Are Not Available At This Time";
        }


      })
    });
  }

  pushData() {
      for(let i = this.students.length, j = 0; (i < this.dataLength) && (j < 10); i++, j++) {
        this.students.push(this.setStudentProp(this.data[i]));
      }
      this.studentsLength = this.students.length;
  }

    doInfinite(infiniteScroll : InfiniteScroll) {
      if(this.students.length != this.dataLength) {
        setTimeout(() => {
          this.pushData();

          infiniteScroll.complete();
        }, 1000);
      } else {
        infiniteScroll.enable(false);
      }
  }

  public setStudentProp(student) : any {
    var diffNew = Number(student['diff']);
    // if(student['avatar']) {
    //   student['avatar'] = DOMAIN_URL + student['avatar']
    // }

    if(isNaN(diffNew)) {
      student['icon'] = 'remove';
      student['cls'] = 'ASI-DarkGrey';
    }
    else if(diffNew > 0){
      student['icon'] = 'arrow-up';
      student['cls'] = 'ASI-Teal';
    }
    else if(diffNew < 0){
      student['diff'] = Math.abs(student['diff']);
      student['icon'] = 'arrow-down';
      student['cls'] = 'ASI-Red';
    }
    else if(diffNew == 0){
      student['icon'] = 'swap';
      student['cls'] = 'ASI-DarkGrey';
    }

    student['display'] = student['username'];

    return student;
  }

  swapName(student : any) {
    student['display'] = (student['display'] == student['username'] ? student['name'] : student['username'])
  }

}
