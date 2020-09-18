import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { UserProvider } from '../../providers/user-provider/user-provider';
import { ChatViewPage } from '../chat-view/chat-view';
import { Observable } from 'rxjs/Observable';
import { Facebook } from '@ionic-native/facebook';
import { AdMobFree } from '@ionic-native/admob-free';
import { NA_INTERTITIEL_ID, FN_INTERTITIEL_ID } from '../../providers/config/config';

@Component({
    templateUrl: 'users.html',
    selector: 'user-page'
})
export class UsersPage {
    users: Observable<any>;
    filteredList = [];
    uid: string;
    constructor(public nav: NavController, public userProvider: UserProvider, private facebook: Facebook,
        public admobFa: AdMobFree, public admobNa: AdMobFree,
        private toastCtrl: ToastController) { }


    getChildList() {
        return this.users.map(changes => {
            return changes.map(c => ({ key: c.key, ...c }));
        });
    }
    ionViewDidLoad() {
        this.userProvider.getUid()
            .then(uid => {
                this.uid = uid;
                this.users = this.userProvider.getAllUsers();

                this.facebook.logEvent("LoginPage");
                this.getChildList().subscribe(children => {
                    this.filteredList = children.filter(child => {
                        return this.uid != child.key && child.enabled;
                    });
                    console.log(this.filteredList);
                })
            });


        this.admobFa.interstitial.config({ id: FN_INTERTITIEL_ID, isTesting: false });
        this.admobNa.interstitial.config({ id: NA_INTERTITIEL_ID, isTesting: false });

    }
    searchUser(val) {
        this.getChildList().subscribe(children => {
            this.filteredList = children.filter(child => {
                return this.uid != child.key && child.enabled;
            });
            if (val && val.trim() !== "") {
                this.filteredList = this.filteredList.filter(child => {
                    return (child.fullName && child.fullName.toLowerCase().includes(val.toLowerCase()))
                        || (child.email && child.email.toLowerCase().includes(val.toLowerCase()))
                        ;
                });
            }

        })
    }

    onCancel(event) {
        console.log(event);
        this.getChildList().subscribe(children => {
            this.filteredList = children.filter(child => {
                return this.uid != child.key && child.enabled;
            });
        });
    }

    logChat(chat) {
        console.log(chat);
        return chat;
    }
    openChat(user: any) {
        this.admobFa.interstitial.prepare()
            .then((t) => {
                this.admobFa.interstitial.show().then(succ => {
                    setTimeout(() =>
                        this.admobNa.interstitial.prepare()
                            .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 5000);
                }).catch(e => {
                    setTimeout(() =>
                        this.admobNa.interstitial.prepare()
                            .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 5000);
                    this.displayErrorInterstitiel();
                });

            }, err => this.displayErrorInterstitiel());
        let param = { uid: this.uid, interlocutor: user };
        this.nav.push(ChatViewPage, param);


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