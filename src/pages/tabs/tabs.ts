import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { LeaderboardPage } from '../leaderboard/leaderboard';
import { ProfilePage } from '../profile/profile';
import { ActivityPage } from '../activity/activity';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  homeRoot: any = HomePage;
  activityRoot: any = ActivityPage;
  rankingRoot: any = LeaderboardPage;
  profileRoot: any = ProfilePage;
  moreRoot: any = SettingsPage;

  moreParams = {
    root: this.nav,
  }
  constructor(public nav: NavController) {}
}
