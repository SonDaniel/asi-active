import { Component } from '@angular/core';
import { Keyboard } from 'ionic-native';
import { NavController, PopoverController } from 'ionic-angular';
import { CategoryPage } from '../category/category';
import { DatabaseService } from '../../services/database.service';
import { DetailsPage } from '../details/details';

import { PopoverPage } from './popover';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'activity',
  templateUrl: 'activity.html'
})
export class ActivityPage {
	locations: Array<Object> = [];
  searchData : Observable<any[]>;
	searchInput: string = "";
  search: boolean;
  private searchTerms = new Subject<string>();

  constructor(public popoverCtrl: PopoverController, public navCtrl: NavController, public db: DatabaseService) {}

  ionViewDidLoad() {
    this.search = false;
    this.searchData = this.searchTerms
    .debounceTime(300)
    .distinctUntilChanged()
    .switchMap(term => term ? this.db.search(term) : Observable.of<any[]>([]))
    .catch(err => {
      console.log('Error found in searchTerm: ', JSON.stringify(err));
      return Observable.of<any[]>([]);
    });

    this.db.query('Section').then(res => {
      //TO DO: TEMPORARY SOLUTION. NEED TO FIX indexOf
      let temp = {};
      for (let x = 0; x < res.length; x++) {
        if(res.item(x).name === 'CUSTOM') {
          temp = res.item(x);
        } else {
          this.locations.push(res.item(x));
        }
        if(x == 2) {
          this.locations.push(temp);
        }
      }

      // let customIndex = this.locations.indexOf((index) => {
      //   return index.name === "CUSTOM";
      // });
      // let customItem = this.locations.splice(customIndex, 1);
      // this.locations.splice(2, 0, customItem);
    });
  }

  ionViewWillLeave() {
    this.search = false;
    this.searchInput = "";
    this.searchData = Observable.of<any[]>([]);
  }

  tapEvent(id, name: string) {
  	this.navCtrl.push(CategoryPage, {
      sectionName: name,
      sectionId : id
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

  getPoints(points : any) : string {
    if(points === 1)
      return points + " PT";
    else
      return points + " PTS";
  }

  check() : any {
    if(this.searchInput === "") {
      this.search = false;
      return;
    } else {
      return;
    }
  }

  changeView(data : any) {
    // this.navCtrl.push(DetailsPage, {
    //   sectionName: data.section,
    //   locationName : data.category,
    //   location : data.category_id,
    //   points : data.points,
    //   description: data.description
    // });
  }

  public getImage(location : string) : string {
    return "assets/img/" + location.toLowerCase() + ".png";
  }

  presentPopover(myEvent, description) {
    if(description) {
      let popover = this.popoverCtrl.create(PopoverPage, {
        description: description
      });
      popover.present({
        ev: myEvent
      });
    }
  }

  filterSearch(ev: any) {
    this.searchTerms.next(ev.target.value);
  }

}