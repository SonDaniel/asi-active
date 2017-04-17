import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';

import { AjaxService } from '../../services/ajax.service';
import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';
import { DetailsPage } from '../details/details';

import moment from 'moment/src/moment';
import 'chart.js/src/chart';
declare var Chart;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	location: Array<Object>;
	public name: string;
	public avatar : string;
	public quote: string;
	public totalPoints: number;
	public remainingPoints : number;
	public events : Array<any> = [];

	// private promiseList = [this.getEtag(), this.getLatestEvent(), this.updateEventTable(), this.updateCache(), this.getEvents()];

	listQuotes = 	[	"",
						"Don't wait until you've reached your goal to be proud of yourself. Be proud of every step you take toward reaching that goal.",
						"Challenging yourself every day is one of the most exciting ways to live.",
						"\"It is never too late to be what you might have been.\" - George Eliot",
						"\"What you do today can improve all your tomorrows.\" - Ralph Marston",
						"\"Don't watch the clock; do what it does. Keep going.\" - Sam Levenson",
						"I’m working on myself; for myself; by myself.",
						"The human body is the best picture of the human soul.",
						"To achieve something you’ve never had before, you must do something you’ve never done before.",
						"I can and I will.",
						"Fall in love with taking care of your body.",
						"You can do anything, but not everything.",
						"Your body can stand almost anything, it’s your mind you have to convince.",
						"Build your body, build your character.",
						"Don’t wish for a good body, work for it.",
						"Teamwork makes the dream work.",
						"\"You can't win unless you learn how to lose.\" - Kareem Abdul-Jabbar",
						"\"Winners never quit and quitters never win.\" - Vince Lombardi",
						"\"Just be patient. Let the game come to you. Don't rush. Be quick, but don't hurry.\" - Earl Monroe",
						"\"Success is where preparation and opportunity meet.\" - Bobby Unser",
						"Three little words: You've Got This. (Now, Get It.)",
					];

	@ViewChild("homecanvas") canvas: ElementRef;

  	constructor (
		public navCtrl: NavController, 
	  	private ajax : AjaxService,
		private db : DatabaseService, 
		public toastCtrl: ToastController,
		private profile : ProfileService
	) {}

	ionViewDidLoad() {
		this.db.rawQuery(`
			SELECT EventLog.event_id as event_id, EventLog.datetime as datetime
			FROM EventLog inner join Profile 
			ON EventLog.profile_id = Profile.id
			WHERE
				Profile.id = ${this.profile.getId()}
				AND 
				EventLog.synced = 0;
		`).then((res) => {
			if(res.length) {
				let data = [];
				for(let x = 0; x < res.length; x++) {
					res.item(x).datetime = moment.utc(res.item(x).datetime).local().format('YYYY-MM-DD HH:MM:SS');
					data.push(res.item(x));
				}
				this.ajax.sync('event-logs/', data).then(() => {
					console.log("EventLog pushed to server.");
					this.db.update('EventLog', {synced : 1}, 'profile_id = ?', [String(this.profile.getId())]).then(() => {
						console.log('EventLog table synced.');
					});
				});
			} else {
				console.log("EventLog up-to-date in server.");
			}
		}).catch((err) => {console.log(err)});

		
		this.db.rawQuery(`
			SELECT ActivityLog.category_id as category_id, ActivityLog.datetime as datetime
			FROM ActivityLog inner join Profile
			ON ActivityLog.profile_id = Profile.id
			WHERE 
				Profile.id = ${this.profile.getId()}
				AND 
				ActivityLog.synced = 0
		`).then((res) => {
			if(res.length) {
				let data = [];
				for(let x = 0; x < res.length; x++) {
					res.item(x).datetime = moment.utc(res.item(x).datetime).local().format('YYYY-MM-DD HH:m:ss');
					data.push(res.item(x));
				}
				this.ajax.sync('activity-logs/', data).then(() => {
					console.log("ActivityLog pushed to server.");
					this.db.update('ActivityLog', {synced : 1}, 'profile_id = ?', [String(this.profile.getId())]).then(() => {
						console.log('ActivityLog table synced.');
					});
				});
			} else {
				console.log("ActivityLog up-to-date in server.");
			}
		}).catch((err) => {console.log(err)});
	}

  	ionViewWillEnter() {
		this.avatar = this.profile.getAvatarUrl();
		this.quote = this.getQuote();
		//Grab total points 
		this.profile.getTotalPoints().then((res) => {
			this.totalPoints = res;
			this.drawChart();
		});

		//TO DO: Need to make promise chain to work
		// this.promiseChain(this.promiseList);

		//Grab etag from Cache table
		this.db.query('Cache',['etag'], 'type = ?', ['events']).then((res) => {
			//Grab any latest event
			this.ajax.get('events/latest/',true, res.item(0).etag).then((res) => {
				console.log('Etag has changed');
				//Update cache table		
				this.db.update('Cache', {etag : res.headers.get('ETag'), data : JSON.stringify(res.data)}, 'type = ?', ['events']).then(() => {});
				this.updateEventTable(res.data).then((res) => {
					this.db.query('Event', undefined, "active = ? and promote = ? and end >= datetime('now')", ['true', 'true'], undefined, undefined, 'datetime(start) asc').then((res) => {
						for(let x = 0; x < res.length; x++) {
							this.events.push(res.item(x));
						}
					});
				});
			}).catch((err) => { /* Possible 304 or 404 */ 
				this.db.query('Event', undefined, "active = ? and promote = ? and end >= datetime('now')", ['true', 'true'], undefined, undefined, 'datetime(start) asc').then((res) => {
					for(let x = 0; x < res.length; x++) {
						this.events.push(res.item(x));
					}
				});
			});
		});
  	}

	ionViewWillLeave() {
		this.events = [];
	}

	// private promiseChain(list) {
	// 	let promise = Promise.resolve();
	// 	return list.reduce(function(pacc, fn) {
	// 		return pacc = pacc.then(fn)
	// 	}, promise);
	// }

	// private getEtag() {
	// 	return this.db.query('Cache',['etag'], 'type = ?', ['events']).then((res) => {
	// 		return Promise.resolve(res.item(0).etag);
	// 	});
	// }

	// private getLatestEvent(data?) {
	// 	return this.ajax.get('events/latest/',true, data).then((res) => {
	// 		return Promise.resolve({'etag' : res.headers.get('ETag'), 'data' : res.data});
	// 	});
	// }

	// private updateCache(data?) {
	// 	return this.db.update('Cache', data, 'type = ?', ['events']).then((res) => {
	// 		return Promise.resolve(data);
	// 	});
	// }

	// private getEvents() {
	// 	this.db.query('Event', undefined, "active = ? and promote = ? and end >= datetime('now')", ['true', 'true'], undefined, undefined, 'datetime(start) asc').then((res) => {
	// 		for(let x = 0; x < res.length; x++) {
	// 			this.events.push(res.item(x));
	// 		}
	// 	});
	// }

	updateEventTable(data : any) {
		let promiseChain = [];
		for(let x = 0; x < data.length; x++) {
			//Check to see if ID exist in event table
			let promise = this.db.query('Event',['id'], 'id = ?', [data[x].id]).then((res) => {
				let subPromise;
				if(res.length) { //id is found. UPDATE
					subPromise = this.db.update('Event', data[x], 'id = ?', [data[x].id]).then(() => {
						console.log('updated event table.');
					});
				} else { //id is not there. INSERT
					subPromise = this.db.insert('Event', data[x]).then(() => {});
				}
				return Promise.all([res, subPromise]);
			});
			promiseChain.push(promise);

			if(x == data.length - 1) {
				return Promise.all(promiseChain);
			}
		}
	}

	getDetails(event : any) {
		this.navCtrl.push(DetailsPage, {
		sectionName : "EVENTS",
		eventData : event
		});
	}

	getDate(date : any) {
		return moment(date).format('M/D');
	}

	getQuote() : string {
		var x = Math.floor((Math.random() * 20) + 1);
		return this.listQuotes[x];
	}

	greetings() {
		var date = (new Date()).getHours();
		if(date < 12) {
			return "Good Morning";
		} else if (date >= 12 && date < 17) {
			return "Good Afternoon";
		} else {
			return "Good Evening";
		}
	}

	private drawChart() {
		var canvas : any = document.getElementById("homecanvas");
		var ctx = canvas.getContext("2d");
		let win = 250;
		var points = this.totalPoints;
		let total = 500;

		var more_points;
		var values;
		var bg_colors;

		if((win - points)>0){ //calculations to half way
			more_points = win-points;
			values = [points,more_points, total - win,];
			bg_colors = ["#16D9CB",] ;
			this.remainingPoints = win - points;
		}
		else{ //calculations to full win
			more_points = points-win;
			values = [win ,more_points, total - points,];
			bg_colors = ["#16D9CB","#16D9CB",];
			this.remainingPoints = total - points;
		}

		var data = {
		    datasets: [
		        {
		            data: values,
		            backgroundColor: bg_colors,
		            borderWidth: 9,
		        }]
		};
		Chart.defaults.global.tooltips.enabled = false;
	
		var promisedDeliveryChart = new Chart(ctx, {
		  type: 'doughnut',
		  data: data,
		  options: {
			  	events: [],
		    	rotation:   -5 * Math.PI/4,
		      	circumference: 1.5 * Math.PI,
		      	cutoutPercentage: 80,
		      	responsive : true,
		      	tooltip: {
			      enable: false
			    },
			}
		});
	}

}
    