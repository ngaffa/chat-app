import { Component } from '@angular/core';
import { UserProvider } from '../../providers/user-provider/user-provider';
import { ChatsProvider } from '../../providers/chats-provider/chats-provider';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/map';
import { ChatViewPage } from '../chat-view/chat-view';
import { NavController, ToastController, Events } from 'ionic-angular';
import { AdMobFree } from '@ionic-native/admob-free';
import { FN_INTERTITIEL_ID, NA_INTERTITIEL_ID } from '../../providers/config/config';
@Component({
    templateUrl: 'chats.html'
})
export class ChatsPage {
    chats = [];
    filteredList = [];
    receivedKey: string;

    // chats: any[] = [];
    constructor(public chatsProvider: ChatsProvider,
        public userProvider: UserProvider,
        public db: AngularFireDatabase,
        public nav: NavController,
        public admobFa: AdMobFree, public admobNa: AdMobFree,
        private toastCtrl: ToastController,
        public events: Events) {

        events.subscribe('notification:received', (key) => {
            // the user key is passinging in param
            this.filteredList.forEach(child => {
                if (!child.badgeCount)
                    child.badgeCount = 0;
                if (child.key === key) {
                    child.badgeCount++
                }

            });
        });

        this.chatsProvider.getChats().then(chats => {
            console.log(chats);

            chats.subscribe(
                users => {
                    console.log(users);
                    users.forEach(chat => {
                        console.log(chat);
                        this.db.object(`/users/${chat.$key}`).subscribe(user => {
                            console.log('user');

                            console.log(user);
                            if (this.chats.find(p => p.key === user.key) == null) {
                                this.chats.push(user);

                            }
                            else {
                                let us = this.chats.find(p => p.key === user.key);
                                us.picture = user.picture;
                                us.fullName = user.fullName;
                            }

                            this.filteredList = this.chats;

                        })


                    })

                }
            )
        });

        // this.chatsProvider.getChats()
        //     .then(chats => {
        //         this.chats = chats.snapshotChanges().map(users => {
        //             console.log('users :');
        //             console.log(users);
        //             return users.map(chat => {
        //                 console.log("chat user : " + chat);
        //                 console.log("chat user key : " + chat.key);
        //                 this.db.object(`/users/${chat.key}`).valueChanges().subscribe(a => console.log(a));
        //                 return this.db.object(`/users/${chat.key}`).valueChanges();

        //             });
        //         });
        //     });

        // this.chatsProvider.getChats().then(chats => {
        //     this.chats = chats.snapshotChanges().pipe(
        //         map(users => {
        //             return users.map(chat => {
        //                 this.db.object(`/users/${chat.key}`).valueChanges().subscribe(
        //                     p => {
        //                         console.log("value changes");
        //                         console.log(p);
        //                         this.lstusers.push(p);
        //                     });
        //                 return this.db.object(`/users/${chat.key}`).valueChanges().source;
        //             })
        //         }
        //         ));
        //     this.chats.subscribe(p => {
        //         console.log("observable");
        //         console.log(p);
        //         console.log("observable first");

        //         console.log(p[0]);
        //     })
        //     console.log(this.lstusers);
        // }
        // );








        // this.chatsProvider.getChats()
        //     .then(chats => {
        //         this.chats = chats.map(users => {
        //             return users.map(user => {
        //                 user.info = this.db.object(`/users/${user.$key}`);
        //                 return user;
        //             });
        //         });
        //     });




        // this.chatsProvider.getChats()
        //     .then(chats => {

        //         let toto = this.chats = chats.snapshotChanges().
        //             map(chat => {
        //                 return chat.map(users => {

        //                     return this.db.object(`/users/${users.key}`);
        //                 });
        //             });



        //     });

    }


    searchChat(val) {
        this.filteredList = this.chats;
        if (val && val.trim() !== "") {
            this.filteredList = this.filteredList.filter(child => {
                return (child.fullName && child.fullName.toLowerCase().includes(val.toLowerCase()))
                    || (child.email && child.email.toLowerCase().includes(val.toLowerCase()));

            });
        }
    }
    onCancel(event) {
        this.filteredList = this.chats;

    }

    ionViewDidEnter() {
    }

    ionViewDidLoad() {
        this.admobFa.interstitial.config({ id: FN_INTERTITIEL_ID, isTesting: false });
        this.admobNa.interstitial.config({ id: NA_INTERTITIEL_ID, isTesting: false });



    }


    logChat(chat) {
        console.log(chat);
        return chat;
    }
    openChat(chat: any) {

        this.admobFa.interstitial.prepare()
            .then((t) => {
                this.admobFa.interstitial.show().then(succ => {
                    setTimeout(() =>
                        this.admobNa.interstitial.prepare()
                            .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 5000);
                }).catch(e => {
                    this.displayErrorInterstitiel();
                    setTimeout(() =>
                        this.admobNa.interstitial.prepare()
                            .then((t) => { this.admobNa.interstitial.show(); }, err => this.displayErrorInterstitiel()), 5000);
                });


            }, err => this.displayErrorInterstitiel());


        this.userProvider.getUid()
            .then(uid => {

                this.events.publish('notification:decrize', chat.badgeCount);
                chat.badgeCount = 0;
                let param = { uid: uid, interlocutor: chat };
                this.nav.push(ChatViewPage, param);
            });

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

