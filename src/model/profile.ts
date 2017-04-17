export class Profile {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	gender: string;
	dept: string;
	dob: string;
	jwt: string;
	sid: string;
	avatar: string;

	constructor(id: number, username: string, first_name: string,
		last_name: string, email: string, gender: string, dept: string,
		dob: string, jwt: string, sid: string, avatar: string) {

		this.id = id;
		this.username = username;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.gender = gender;
		this.dept = dept;
		this.dob = dob;
		this.jwt = jwt;
		this.sid = sid;
		this.avatar = avatar;
	}
}