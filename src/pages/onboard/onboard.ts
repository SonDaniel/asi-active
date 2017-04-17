import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';

import { DatabaseService } from '../../services/database.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'page-onboard',
  templateUrl: 'onboard.html'
})
export class OnboardPage {
  @ViewChild(Slides) slides: Slides;
  viewData : Array<Object>;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db : DatabaseService,
    private profile : ProfileService) {}

  ionViewDidLoad() {}

  ionViewWillEnter() {
      this.viewData = [
        {image : 'assets/img/onboard/onboard_ready.png', alt : "ready icon", buttonTitle: 'next', description:"Ready to get fit and involved with ASI?"},
        {image : 'assets/img/onboard/onboard_points.png', alt : "points icon", buttonTitle: 'next', description:"Earn wellness points by checking in to activities."},
        {image : 'assets/img/onboard/onboard_rewards.png', alt : "rewards icon", buttonTitle: 'next', description:"Win real life rewards for being active."},
        {image : 'assets/img/onboard/onboard_events.png', alt : "events icon", buttonTitle: 'next', description:"Check out events happening on campus."},
        {image : 'assets/img/onboard/onboard_compete.png', alt : "compete icon", buttonTitle: 'get started', description:"See how you stack up against the ASI community."}
    ]
  }

  button(ev) {
    if(this.slides.isEnd()) {
      this.db.update('Profile', {show_onboard : 0}, 'id = ?', [String(this.profile.getId())]).then(() => {
        this.navCtrl.setRoot(TabsPage);
      });
    } else {
      this.slides.slideNext(500);
    }
  }

  skip(ev) {
    this.db.update('Profile', {show_onboard : 0}, 'id = ?', [String(this.profile.getId())]).then(() => {
      this.navCtrl.setRoot(TabsPage);
    });
  }
}
