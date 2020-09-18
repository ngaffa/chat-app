import { Facebook } from '@ionic-native/facebook';
import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth-provider/auth-provider';
import { UserProvider } from '../../providers/user-provider/user-provider';
import { AngularFireDatabase } from 'angularfire2/database';
import { FN_INTERTITIEL_ID, NA_INTERTITIEL_ID } from '../../providers/config/config';
import { AdMobFree } from '@ionic-native/admob-free';

@Component({
    templateUrl: 'account.html',
    selector: 'account-page'
})
export class AccountPage {
    rootNav;
    user: any = {};

    constructor(public nav: NavController,
        public auth: AuthProvider,
        public userProvider: UserProvider,
        public afdb: AngularFireDatabase,
        private facebook: Facebook,
        public admobFa: AdMobFree, public admobNa: AdMobFree,
        private toastCtrl: ToastController
    ) {
        this.userProvider.getUser()
            .then(userObservable => {
                userObservable.subscribe(user => {
                    console.log(user);
                    this.user = user;
                    this.facebook.logEvent("AccountPage");
                });
            });
    }

    ionViewDidLoad() {
        this.admobFa.interstitial.config({ id: FN_INTERTITIEL_ID, isTesting: false });
        this.admobNa.interstitial.config({ id: NA_INTERTITIEL_ID, isTesting: false });

    }

    save() {

        this.userProvider.saveFullName(this.user.fullName);
    }

    //save user info
    updatePicture() {
        this.admobFa.interstitial.prepare()
            .then((t) => {
                this.admobFa.interstitial.show();
                setTimeout(() =>
                    this.admobNa.interstitial.prepare()
                        .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 10000);
            }, err => this.displayErrorInterstitiel());
        this.userProvider.updatePicture();

    };

    logout() {
        this.auth.logout();
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