import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transfer } from '@ionic-native/transfer';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { SignupPage } from '../pages/signup/signup';
import { LoginPage } from '../pages/login/login';
import { OnboardPage } from '../pages/onboard/onboard';
import { ProfilePage } from '../pages/profile/profile';
import { LeaderboardPage } from '../pages/leaderboard/leaderboard';
import { ActivityPage } from '../pages/activity/activity';
import { CategoryPage } from '../pages/category/category';
import { PopoverPage } from '../pages/activity/popover';
import { SettingsPage } from '../pages/settings/settings';
import { ActivityLogPage } from '../pages/activity-log/activity-log';
import { EditProfile } from '../pages/profile/edit-profile';
import { DetailsPage } from '../pages/details/details';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { FeedbackPage } from '../pages/feedback/feedback';
import { ChangepasswordPage } from '../pages/changepassword/changepassword';
import { ChangeusernamePage } from '../pages/changeusername/changeusername';
import { FaqPage } from '../pages/faq/faq';
import { DatabaseService } from '../services/database.service';
import { AjaxService } from '../services/ajax.service';
import { ProfileService } from '../services/profile.service';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage,
    SignupPage,
    LoginPage,
    OnboardPage,
    ProfilePage,
    LeaderboardPage,
    ActivityPage,
    SettingsPage,
    ActivityLogPage,
    EditProfile,
    PopoverPage,
    CategoryPage,
    DetailsPage,
    ForgotPasswordPage,
    FeedbackPage,
    ChangepasswordPage,
    ChangeusernamePage,
    FaqPage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage,
    SignupPage,
    LoginPage,
    OnboardPage,
    ProfilePage,
    LeaderboardPage,
    ActivityPage,
    SettingsPage,
    ActivityLogPage,
    EditProfile,
    PopoverPage,
    CategoryPage,
    DetailsPage,
    ForgotPasswordPage,
    FeedbackPage,
    ChangepasswordPage,
    ChangeusernamePage,
    FaqPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseService,
    AjaxService,
    ProfileService,
    Transfer
  ]
})
export class AppModule {}
