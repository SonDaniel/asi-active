import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

import { Profile } from '../model/profile';

@Injectable()
export class ProfileService {

	private profile: Profile;

	/**
	 * Creates a ProfileService that has information about the logged in user.
	 * @param db - Database class to interact with SQLite database.
	 */
	constructor(private db: DatabaseService) {}

	/**
	 * Initiliazes the profile by querying for the logged in user stored in the database.
	 * @return {Promise<any>} A promise for the fetched user if found.
	 */
	initProfile(): Promise<any> {
		return this.db.query('Setting', ['value'], 'key = ?', ['current_user']).then(res => {
			if (res.length == 1) {
				return Promise.all([
					res,
					this.db.query('Profile', null, 'id=?', [res.item(0).value]).then(res => {
						if (res.length == 1) {
							let p = res.item(0);
							// Set default avatar if none exists
							if (!p.avatar) {
								p.avatar = 'assets/img/profile.png';
							}
							this.profile = new Profile(
								p.id, p.username, p.first_name, p.last_name,
								p.email, p.gender, p.dept, p.dob, p.jwt, p.sid,
								p.avatar);
							
							return 'Profile Service has been initialized successfully.'
						} else {
							throw new Error('Error querying for profile with given id.');
						}
					})
				]);
			} else {
				throw new Error('Error querying for current logged in user.');
			}
		})
		.catch(err => {
			// Log error and re-throw
			console.log('No logged in user found in Settings table: ' + JSON.stringify(err.message));
			throw new Error('Failed querying for logged in user.');
		});
	}

	/**
	 * Returns the editable profile object of the user.
	 * @return {Object} Editable Profile Object.
	 */
	getProfile() : any {
		return {
			user : {
				username : this.profile.username,
				first_name : this.profile.first_name,
				last_name : this.profile.last_name,
				email : this.profile.email
			},
			id : this.profile.sid,
			gender : this.profile.gender,
			dept : this.profile.dept,
			dob : this.profile.dob
		};
	}

	/**
	 * Returns the JWT for the logged in user.
	 * @return {string} The JWT.
	 */
	getJWT(): string {
		return this.profile.jwt;
	}

	/**
	 * Returns the first name for the logged in user.
	 * @return {string} The first name.
	 */
	getFirstName() : string {
		return this.profile.first_name;
	}

	/**
	 * Returns the last name for the logged in user.
	 * @return {string} The last name.
	 */
	getLastName() : string {
		return this.profile.last_name;
	}

	/**
	 * Returns the full name for the logged in user.
	 * @return {string} The full name.
	 */
	getFullName(): string {
		return this.profile.first_name + ' ' + this.profile.last_name;
	}

	/**
	 * Returns the username for the logged in user.
	 * @return {string} The username.
	 */
	getUsername(): string {
		return this.profile.username;
	}

	/**
	 * Returns the user id for the logged in user.
	 * @return {number} The user id.
	 */
	getId(): number {
		return this.profile.id;
	}

	/**
	 * Returns the student id for the logged in user.
	 * @return {string} The student id.
	 */
	getStudentId() : string {
		return this.profile.sid;
	}

	/**
	 * Returns the avatar URL for the logged in user.
	 * @return {string} The avatar URL.
	 */
	getAvatarUrl(): string {
		return this.profile.avatar;
	}

	/**
	 * Returns the email for the logged in user.
	 * @return {string} The email.
	 */
	getEmail() : string {
		return this.profile.email;
	}

	/**
	 * Returns department name based off acroymn.
	 * @return {string} Department name
	 */
	getDepartment() : string {
		switch(this.profile.dept) {
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

	/**
	 * Returns the gender of the logged in user.
	 * @return {string} The gender.
	 */
	getGender() : string {
		return this.profile.gender;
	}
	
	/**
	 * Returns the date of birth of the logged in user.
	 * @return {string} The date of birth (ISO format)
	 */
	getDob() : string {
		return this.profile.dob;
	}

	/**
	 * Returns the total points the logged in user has earned.
	 * @return {Promise<any>} A promise for fetching user total points.
	 */
	getTotalPoints() : Promise<any> {
		return this.db.rawQuery(`
					SELECT sum(points) as points 
					FROM (
						SELECT c.points as points
						FROM Profile as s 
						INNER JOIN ActivityLog l
						ON s.id = l.profile_id
						INNER JOIN Category as c
						ON l.category_id = c.id 
						WHERE s.id = ${this.getId()}
						UNION all
						SELECT e.points as points
						FROM Profile as a 
						INNER JOIN EventLog as b on a.id = b.profile_id 
						INNER JOIN Event as e 
						ON b.event_id = e.id 
						WHERE a.id = ${this.getId()}
					) log
				`).then((res) => {
					if (res.item(0).points) {
						return res.item(0).points;
					} else {
						return 0;
					}
				});
	}

	/**
	 * Returns the daily points the logged in user has earned.
	 * @return {Promise<any>} A promise for fetching user daily points.
	 */
	getDailyPoints() : Promise<any> {
		return this.db.rawQuery(`
			SELECT sum(c.points) as points
			FROM Profile as s inner join ActivityLog as l
			ON s.id = l.profile_id inner join Category as c
			ON l.category_id = c.id 
			WHERE 
				Date(l.datetime) = Date('now') 
				AND
				s.id = ${this.getId()};
		`).then((res) => {
			return res.item(0).points;
		})
	}

	/**
	 * Returns the weekly points the logged in user has earned.
	 * @return {Promise<any>} A promise for fetching user weekly points.
	 */
	getWeeklyPoints() : Promise<any> {
		return this.db.rawQuery(`
			SELECT sum(points) as points, week
			FROM (
				SELECT c.points as points, strftime('%W', l.datetime) as week
				FROM Profile as s inner join ActivityLog as l
				ON s.id = l.profile_id inner join Category as c
				ON l.category_id = c.id
				WHERE s.id = ${this.getId()}
				UNION all 
				SELECT a.points as points, strftime('%W', p.datetime) as week
				FROM Profile as b inner join eventlog as p
				ON b.id = p.profile_id inner join event as a
				ON p.event_id = a.id
				WHERE b.id = ${this.getId()})
			log
			GROUP BY week;`).then((res) => {
				let data = [];
				if(res.length) {
					for(let x = 0; x < res.length; x++) {
						data.push(res.item(x));
					} 
				}
				return data;
			});
	}
	
}