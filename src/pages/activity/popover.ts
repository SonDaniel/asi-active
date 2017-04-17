import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

/*
  Generated class for the ActivityLog page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  template: '<p style="font-size: 1em" text-wrap padding> {{description}} </p>'
})
export class PopoverPage {
    description : string;
  constructor(public viewCtrl: ViewController, public param : NavParams) {
      this.description = this.param.get('description');
  }

}