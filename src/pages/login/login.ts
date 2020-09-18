import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { validateEmail } from '../../validators/email';
import { AuthProvider } from '../../providers/auth-provider/auth-provider';
import { UserProvider } from '../../providers/user-provider/user-provider';
import { NativeStorage } from '@ionic-native/native-storage';
import { Storage as IonicStorage } from '@ionic/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AdMobFree } from '@ionic-native/admob-free';
import { FN_INTERTITIEL_ID, NA_INTERTITIEL_ID } from '../../providers/config/config';
import { ToastController } from 'ionic-angular';


@Component({
    templateUrl: 'login.html'
})
export class LoginPage {
    loginForm: FormGroup;
    email = new FormControl("", [Validators.required, validateEmail]);
    password = new FormControl("", Validators.required);
    constructor(public nav: NavController,
        public auth: AuthProvider,
        public userProvider: UserProvider,
        public storage: NativeStorage,
        public local: IonicStorage,
        public platform: Platform,
        public afat: AngularFireAuth,
        public admobFa: AdMobFree, public admobNa: AdMobFree,
        private toastCtrl: ToastController

    ) {


    }

    ngOnInit() {
        this.loginForm = new FormGroup({
            email: this.email,
            password: this.password
        });
    }


    signInWithFacebook() {

        this.auth.signInWithFacebook()
            .then((result) => {

                this.admobFa.interstitial.prepare()
                    .then((t) => {
                        this.admobFa.interstitial.show();
                        setTimeout(() =>
                            this.admobNa.interstitial.prepare()
                                .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 7000);
                    }, err => this.displayErrorInterstitiel());
                if (result.user) {
                    this.userProvider.createUserFromFacebook(result.user);
                    if (this.platform.is('android'))
                        this.storage.setItem('uid', result.user.uid);
                    else this.local.set('uid', result.user.uid);
                    this.nav.push(TabsPage);
                }





            }).catch(err => this.displayErrorInterstitiel());
        // this.afat.auth.getRedirectResult().then(result => {
        //     if (result.user) {
        //         this.userProvider.createUserFromFacebook(result.user);
        //         if (this.platform.is('android'))
        //             this.storage.setItem('uid', result.user.uid);
        //         else this.local.set('uid', result.user.uid);
        //         this.nav.push(TabsPage);
        //     }
        // });
    }


    signInWithGoogle() {

        this.auth.signInWithGoogle().then(user => {
            this.admobFa.interstitial.prepare()
                .then((t) => {
                    this.admobFa.interstitial.show();
                    setTimeout(() =>
                        this.admobNa.interstitial.prepare()
                            .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 7000);
                }, err => this.displayErrorInterstitiel());
            if (user) {
                this.userProvider.createUserFromGoogle(user);
                if (this.platform.is('android'))
                    this.storage.setItem('uid', user.uid);
                else this.local.set('uid', user.uid);
                this.nav.push(TabsPage);
            }
        })

        // this.auth.signInWithGoogle()
        //     .then(() => {
        //         return this.afat.auth.getRedirectResult().then((result) => {

        //             this.admobFa.interstitial.prepare()
        //                 .then((t) => {
        //                     this.admobFa.interstitial.show();
        //                     setTimeout(() =>
        //                         this.admobNa.interstitial.prepare()
        //                             .then((t) => { this.admobNa.interstitial.show(); }), 7000);
        //                 });
        //             if (result.user) {
        //                 console.log(result);
        //                 this.userProvider.createUserFromGoogle(result.user);
        //                 if (this.platform.is('android'))
        //                     this.storage.setItem('uid', result.user.uid);
        //                 else this.local.set('uid', result.user.uid);
        //                 this.nav.push(TabsPage);
        //             }
        //         });






    }
    ionViewDidLoad() {
        this.admobFa.interstitial.config({ id: FN_INTERTITIEL_ID, isTesting: false });
        this.admobNa.interstitial.config({ id: NA_INTERTITIEL_ID, isTesting: false });

    }
    signin() {
        this.auth.signin(this.loginForm.value)
            .then((data) => {
                if (this.platform.is('android')) {
                    this.storage.setItem('uid', data.uid);
                    this.admobFa.interstitial.prepare()
                        .then((t) => {
                            this.admobFa.interstitial.show();
                            setTimeout(() => this.admobNa.interstitial.prepare()
                                .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 7000);
                        }, err => this.displayErrorInterstitiel());
                }
                else this.local.set('uid', data.uid);

                this.userProvider.updateUserTokenForCredentialSignin(data.uid);
                console.log('User does exist');

                this.nav.push(TabsPage);
            }, (error) => {
                this.displayErrorMessage();

            });
    };

    displayErrorMessage() {
        let toast = this.toastCtrl.create({
            message: 'Invalide Email ou mot de passe',
            duration: 6000,
            position: 'top'
        });
        toast.present();
    }
    displayErrorInterstitiel() {
        let toast = this.toastCtrl.create({
            message: 'Impossible de charger l\'annonce',
            duration: 3000,
            position: 'bottom'
        });
        toast.present();
    }
    createAccount() {
        let credentials = this.loginForm.value;
        this.auth.createAccount(credentials)
            .then((data) => {
                if (this.platform.is('android')) {
                    this.storage.setItem('uid', data.uid);
                    this.admobNa.interstitial.prepare()
                        .then((t) => {
                            this.admobNa.interstitial.show();
                            setTimeout(() => this.admobFa.interstitial.prepare()
                                .then((t) => { this.admobFa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 7000);
                        }).catch(err => this.displayErrorMessage());
                }
                else this.local.set('uid', data.uid);

                this.userProvider.createUser(credentials, data.uid);
            }, (error) => {

                this.displayErrorMessage();
            });
    };
}