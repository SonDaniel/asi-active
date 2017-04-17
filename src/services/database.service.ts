import { Injectable } from '@angular/core';
import { SQLite } from 'ionic-native';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DatabaseService {
	private db: SQLite = new SQLite();

	static DB_NAME = 'asi_active.db';
	static DB_VERSION = 1;

	static CREATE_TABLE_SECTION: string = `CREATE TABLE IF NOT EXISTS Section (
		id INTEGER PRIMARY KEY,
		name TEXT NOT NULL,
		description TEXT
	)`;

	static CREATE_TABLE_CATEGORY: string = `CREATE TABLE IF NOT EXISTS Category (
		id INTEGER PRIMARY KEY,
		section_id INTEGER,
		name TEXT NOT NULL,		
		description TEXT,
		points INTEGER,
		active INTEGER DEFAULT 1,
		FOREIGN KEY (section_id) REFERENCES Section(id)
	)`;

	static CREATE_TABLE_ACTIVITY: string = `CREATE TABLE IF NOT EXISTS Activity (
		id INTEGER PRIMARY KEY,
		category_id INTEGER,
		name TEXT NOT NULL,
		active INTEGER DEFAULT 1,		
		FOREIGN KEY (category_id) REFERENCES Category(id)
	)`;

	static CREATE_TABLE_CUSTOM_ACTIVITY: string = `CREATE TABLE IF NOT EXISTS CustomActivity (
		id INTEGER PRIMARY KEY,
		profile_id INTEGER,
		category_id INTEGER,
		name TEXT UNIQUE NOT NULL,		
		FOREIGN KEY (category_id) REFERENCES Category(id),
		FOREIGN KEY (profile_id) REFERENCES Profile(id)
	)`;

	static CREATE_TABLE_EVENT: string = `CREATE TABLE IF NOT EXISTS Event (
		id INTEGER PRIMARY KEY,
		section_id INTEGER,
		name TEXT,
		description TEXT,
		poster TEXT,
		points INTEGER,
		promote INTEGER,
		active INTEGER DEFAULT 1,
		start TEXT NOT NULL,
		end TEXT NOT NULL,
		location TEXT,		
		FOREIGN KEY (section_id) REFERENCES Section(id)
	)`;

	static CREATE_TABLE_PROFILE: string = `CREATE TABLE IF NOT EXISTS Profile (
		id INTEGER PRIMARY KEY,
		username TEXT NOT NULL UNIQUE,
		first_name TEXT,
		last_name TEXT,
		email TEXT,
		gender TEXT,
		dept TEXT,
		dob TEXT,
		jwt TEXT,
		sid TEXT,
		avatar TEXT,
		show_onboard INTEGER DEFAULT 1
	)`;

	static CREATE_TABLE_ACTIVITY_LOG: string = `CREATE TABLE IF NOT EXISTS ActivityLog (
		profile_id INTEGER,
		category_id INTEGER,
		datetime TEXT DEFAULT CURRENT_TIMESTAMP,
		synced INTEGER DEFAULT 0,
		FOREIGN KEY (profile_id) REFERENCES Profile(id) ON DELETE CASCADE,
		FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE,
		PRIMARY KEY (profile_id, category_id, datetime)
	)`;

	static CREATE_TABLE_EVENT_LOG: string = `CREATE TABLE IF NOT EXISTS EventLog (
		profile_id INTEGER,
		event_id INTEGER,
		datetime TEXT DEFAULT CURRENT_TIMESTAMP,
		synced INTEGER DEFAULT 0,
		FOREIGN KEY (profile_id) REFERENCES Profile(id) ON DELETE CASCADE,
		FOREIGN KEY (event_id) REFERENCES Event(id) ON DELETE CASCADE,
		PRIMARY KEY (profile_id, event_id, datetime)
	)`;

	static CREATE_TABLE_SETTING: string = `CREATE TABLE IF NOT EXISTS Setting (
		key TEXT PRIMARY KEY,
		value INTEGER
	)`;

	static CREATE_TABLE_CACHE: string = `CREATE TABLE IF NOT EXISTS Cache (
		type TEXT PRIMARY KEY,
		etag TEXT,
		data BLOB
	)`;

	constructor() { }

	private initDB(): Promise<any> {
		return this.db.transaction(function (tr) {
			tr.executeSql('PRAGMA foreign_keys = ON', {});
			tr.executeSql(DatabaseService.CREATE_TABLE_SECTION, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_CATEGORY, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_ACTIVITY, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_CUSTOM_ACTIVITY, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_PROFILE, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_EVENT, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_ACTIVITY_LOG, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_EVENT_LOG, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_SETTING, {});
			tr.executeSql(DatabaseService.CREATE_TABLE_CACHE, {});
			tr.executeSql('INSERT OR IGNORE INTO Setting (key, value) VALUES (?, ?)', ['db_init', 0]); // Represents if database has been initialized
			tr.executeSql('INSERT OR IGNORE INTO Setting (key, value) VALUES (?, ?)', ['db_version', DatabaseService.DB_VERSION]);
			tr.executeSql('INSERT OR IGNORE INTO Setting (key, value) VALUES (?, ?)', ['current_user', -1]);
			tr.executeSql('INSERT OR IGNORE INTO Cache (type, etag, data) VALUES (?, ?, ?), (?, ?, ?)', ['events', '', '', 'ranks', '', '']);
		})
			.then(() => console.log('Database tables created successfully.'))
			.catch(err => console.log('Transaction error while creating database tables: ' + err.message));
	}

	open(): Promise<SQLite> {
		return this.db.openDatabase({
			name: DatabaseService.DB_NAME,
			location: 'default'
		});
	}

	setUp(data: Array<any>): Promise<any> {
		const sectionQuery = 'INSERT INTO Section (id, name, description) VALUES (?, ?, ?)';
		const categoryQuery = 'INSERT INTO Category (id, section_id, name, description, points, active) VALUES (?, ?, ?, ?, ?, ?)';
		const activityQuery = 'INSERT INTO Activity (id, category_id, name, active) VALUES (?, ?, ?, ?)';
		const eventQuery = 'INSERT INTO Event (id, section_id, name, description, poster, points, promote, active, start, end, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

		let queries = [];

		for (let x in data) {
			let categories = data[x].categories;
			queries.push([sectionQuery, [data[x].id, data[x].name, data[x].description]]);
			for (let y in categories) {
				let activities = categories[y].activities;
				queries.push([categoryQuery, [categories[y].id, categories[y].section_id, categories[y].name, categories[y].description, categories[y].points, categories[y].active]]);
				for (let z in activities) {
					queries.push([activityQuery, [activities[z].id, activities[z].category_id, activities[z].name, activities[z].active]]);
				}
			}
			let events = data[x].events;
			for (let w in events) {
				queries.push([eventQuery, [events[w].id, events[w].section_id, events[w].name, events[w].description, events[w].poster, events[w].points, events[w].promote, events[w].active, events[w].start, events[w].end, events[w].location]]);
			}
		}

		return this.db.sqlBatch(queries);
	}

	upgradeCheck(): Promise<any> {
		// Check DB schema version
		return this.db.executeSql('SELECT value FROM Setting WHERE key=?', ['db_version']).then(
			res => {
				if (res.rows.length) {
					// Expecting one result
					console.log('Database version is: ' + JSON.stringify(res.rows.item(0).value));
					// TODO: Upgrade as necessary
					return 'Database upgrade check ran successfully';
				}
			},
			err => {
				console.log('Error checking for database version: ' + JSON.stringify(err.message));
				// Initialize database
				console.log('Initializing database...');
				return this.initDB();
			}
		);
	}

	query(table: string, columns?: Array<string>, whereClause?: string, whereArgs?: Array<string>, groupBy?: string, having?: string, orderBy?: string, limit?: string): Promise<any> {
		let promise;
		let query = 'SELECT ';

		if (columns) {
			query += columns.join(',');
		} else {
			query += '*'
		}

		query += ' FROM ' + table;

		if (whereClause) {
			query += ' WHERE ' + whereClause;
		}
		if (groupBy) {
			query += ' GROUP BY ' + groupBy;
		}
		if (having) {
			query += ' HAVING ' + having;
		}
		if (orderBy) {
			query += ' ORDER BY ' + orderBy;
		}
		if (limit) {
			query += ' LIMIT ' + limit;
		}

		console.log('Query executed: ' + query + ', using following arguments: ' + whereArgs);

		if (whereClause) {
			promise = this.db.executeSql(query, whereArgs);
		} else {
			promise = this.db.executeSql(query, {});
		}

		return promise.then(
			res => { return res.rows; }
		)
			.catch(
			err => console.log('Error: ' + err.message)
			);
	}

	insert(table: string, content: Object): Promise<any> {
		const columns = Object.keys(content);
		const values = (<any>Object).values(content);

		const query = 'INSERT INTO ' + table + ' (' + columns.join(',') + ') VALUES (' + '?'.repeat(columns.length).split('').join(',') + ')';

		return this.db.executeSql(query, values)
			.then(
			res => { return { 'rowid': res.insertId }; }
			).catch(
			err => console.log('Error: ' + err.message)
			);
	}

	update(table: string, content: Object, whereClause: string, whereArgs: Array<string>): Promise<any> {
		let columns = Object.keys(content);
		let values = (<any>Object).values(content);

		const query = 'UPDATE ' + table + ' SET ' + columns.map(function (e) { return e + ' = ?'; }).join(',') + ' WHERE ' + whereClause;

		return this.db.executeSql(query, values.concat(whereArgs))
			.then(
			res => { return { 'rowsAffected': res.rowsAffected }; }
			).catch(
			err => console.log('Error: ' + err.message)
			);
	}

	delete(table: string, whereClause: string, whereArgs: Array<string>): Promise<any> {
		const query = 'DELETE FROM ' + table + ' WHERE ' + whereClause;

		return this.db.executeSql(query, whereArgs)
			.then(
			res => { return { 'rowsAffected': res.rowsAffected }; }
			).catch(
			err => console.log('Error: ' + err.message)
			);
	}

	bulkDelete(table : string, whereClause: string, whereArgs: Array<string>) : Promise<any> {
		let queries = [], query = 'DELETE FROM ' + table + ' WHERE ' + whereClause + ';';
		for(let x in whereArgs) {
			queries.push([query, [whereArgs[x]]]);
		}

		return this.db.sqlBatch(queries)
			.then(() => console.log('Bulk delete was successful'))
			.catch(err => console.log('Error deleting data in bulk: ' + err.message));
	}

	bulkInsert(table: string, content: Array<Object>): Promise<any> {
		let queries = [], columns, values, query;

		for (let x in content) {
			columns = Object.keys(content[x]);
			values = (<any>Object).values(content[x]);
			query = 'INSERT INTO ' + table + ' (' + columns.join(',') + ') VALUES (' + '?'.repeat(columns.length).split('').join(',') + ')';
			queries.push([query, values]);
		}

		return this.db.sqlBatch(queries)
			.then(() => console.log('Bulk insert was successful.'))
			.catch(err => console.log('Error inserting data in bulk: ' + err.message));
	}

	rawQuery(query: string): Promise<any> {
		return this.db.executeSql(query, {})
			.then(
			res => { return res.rows; }
			).catch(
			err => console.log('Error in rawQuery: ' + err.message)
			);
	}

	search(term: string): Observable<any> {
		let query = `SELECT DISTINCT s.name, c.name, c.id, c.points
					FROM section as s
					INNER JOIN Category as c
					ON s.id = c.section_id
					LEFT JOIN Activity as a
					ON c.id = a.category_id
					WHERE c.name LIKE '%${term}%' OR a.name LIKE '%${term}%'`;
		return Observable.from(this.db.executeSql(query, {})
			.then(res => {
				let data = [];
				for(let x = 0; x < res.length; x++) {
					data.push(res.item(x));
				}
				return data;
			})
			.catch(err => { console.log('here')}));
	}
}