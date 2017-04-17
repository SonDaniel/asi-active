import { Component, ViewChild, ElementRef } from '@angular/core';

import { NavController, ModalController, LoadingController} from 'ionic-angular';
import { Chart } from 'chart.js';

import { ActivityLogPage } from '../activity-log/activity-log';
import { EditProfile } from './edit-profile';

import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
	ProfileSubmenu: string = "activityTab";
	private totalPoints : any;

	@ViewChild("canvas") canvas: ElementRef;
	private ctx : any;
	private myChart : any;

	weeklyPoints : any;
	rank : any;
	rankPoints : any;
	rankAvailable : boolean;
  constructor(
	public navCtrl: NavController, 
  	public modalCtrl: ModalController, 
	public loadingCtrl : LoadingController, 
	private ajax: AjaxService, 
	private db: DatabaseService,
	private profile : ProfileService) {}

	ionViewWillEnter() {
		this.profile.getTotalPoints().then((points) => this.totalPoints = points);
		this.profile.getWeeklyPoints().then((points) => {
			this.weeklyPoints = points;
			this.createChart();
		});
		this.db.query('Cache', ['data'],'type = ?', ['ranks']).then((res) => {
			if(res.item(0).data) {
				this.rankAvailable = true;
				let rankings = JSON.parse(res.item(0).data);
				let username = this.profile.getUsername();
				for(let x in rankings) {
					if(rankings[x]["username"] == username) {
						this.rank = rankings[x]['rank'];
						this.rankPoints = rankings[x]['points'];
					}
				}
			} else {
				this.rankAvailable = false;
			}
		});
	}

	private createChart() {
		this.ctx = document.getElementById("activityChart");
		var weekObject = this.weeklyPoints;

		var labels = [];
		var data = [];
		for(var ii = 0; ii < weekObject.length; ii++) {
			if(weekObject[ii]['week']) {
				labels.push(parseInt(weekObject[ii]['week'], 10));

				if(weekObject[ii]['points']) {
					data.push(parseInt(weekObject[ii]['points']));
				} else {
					data.push(0);
				}
			}

		}

		this.myChart = new Chart(this.ctx, {
			type: 'line',
			data: {
			labels: labels,
			datasets: [{
			label: 'Weekly',
			fill: false,
			backgroundColor: '#4FC3F7',
			data: data,
			borderWidth: 1,
			pointBorderColor: '#FF7043',
			pointBackgroundColor: '#FF7043',

			borderColor: '#4FC3F7',
			}]
			},
			options: {
			events: [],
			scales: {
			yAxes: [{
			ticks: {
			beginAtZero:true
			}
			}]
			}
			}
		});
	}


	ionViewWillLeave() {
		this.myChart.destroy();
		this.ctx = null;
	}

  seeMore() {
  	this.navCtrl.push(ActivityLogPage);
  }

  settings() {
  	let settings = this.modalCtrl.create(EditProfile);
  	settings.present();
  }
}
