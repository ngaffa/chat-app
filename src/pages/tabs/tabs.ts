import { Component } from '@angular/core';
import { ChatsPage } from '../chats/chats';
import { AccountPage } from '../account/account';
import { UsersPage } from '../users/users';
import { Platform, ToastController } from 'ionic-angular';
import { AdMobFree } from '@ionic-native/admob-free';
import { FN_INTERTITIEL_ID, NA_INTERTITIEL_ID } from '../../providers/config/config';
import { Subscription, Observable } from 'rxjs/Rx';
import { Events } from 'ionic-angular';

@Component({
	selector: 'tabs-page',
	templateUrl: 'tabs.html'
})
export class TabsPage {
	chats = ChatsPage;
	users = UsersPage;
	profile = AccountPage;
	private interval;
	private sub: Subscription;
	private isNaInter = false;
	badgeCount: number = 0;
	constructor(
		public platform: Platform,
		public admobFa: AdMobFree, public admobNa: AdMobFree,
		private toastCtrl: ToastController,
		public events: Events) {
		events.subscribe('notification:received', (key) => {
			// the user key is passinging in param
			this.badgeCount++;
		});
		events.subscribe('notification:decrize', (number) => {
			// the exacte number to soustract is passing in param
			this.badgeCount -= number;
		});
	}



	ionViewDidLoad() {
		this.admobFa.interstitial.config({ id: FN_INTERTITIEL_ID, isTesting: false });
		this.admobNa.interstitial.config({ id: NA_INTERTITIEL_ID, isTesting: false });
		this.interval = Observable.interval(30000);
		this.sub = this.interval.subscribe((t) =>
			this.launchInterstitiel()
		);
	}
	ionViewWillLeave(): void {

		this.sub.unsubscribe();
	}

	launchInterstitiel() {
		if (!this.isNaInter) {
			this.admobFa.interstitial.prepare()
				.then((t) => {
					this.admobFa.interstitial.show();
					this.isNaInter = true;
				}, err => this.displayErrorInterstitiel());
		}
		else {
			this.admobNa.interstitial.prepare()
				.then((t) => {
					this.admobNa.interstitial.show();
					this.isNaInter = false;
				}, err => this.displayErrorInterstitiel());
		}
	}

	displayErrorInterstitiel() {
		let toast = this.toastCtrl.create({
			message: 'Impossible de charger l\'annonce',
			duration: 3000,
			position: 'bottom'
		});
		toast.present();
	}

}