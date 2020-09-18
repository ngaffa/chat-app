import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, FabContainer, ToastController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ChatsProvider } from '../../providers/chats-provider/chats-provider';
import { UserProvider } from '../../providers/user-provider/user-provider';
import { Observable } from 'rxjs/Observable';
import { Facebook } from '@ionic-native/facebook';
import { AdMobFree } from '@ionic-native/admob-free';
import { FN_INTERTITIEL_ID, NA_INTERTITIEL_ID, NBR_CLICK } from '../../providers/config/config';
import { UtilProvider } from '../../providers/utils';
import { HttpClient } from '@angular/common/http/';
import { HttpHeaders } from '@angular/common/http';

@Component({
    templateUrl: 'chat-view.html',
    selector: 'chat-view'
})
export class ChatViewPage {
    message: string;
    uid: string;
    interlocutor: string;
    interlocutorToken: string;
    chats: Observable<any>;
    dbchat: FirebaseListObservable<any>;
    @ViewChild(Content) content: Content;
    isNaInter = false;
    countClickSend = 0;
    constructor(public nav: NavController,
        params: NavParams,
        public chatsProvider: ChatsProvider,
        public af: AngularFireDatabase,
        public userProvider: UserProvider,
        private facebook: Facebook,
        public util: UtilProvider,
        public admobFa: AdMobFree, public admobNa: AdMobFree,
        private toastCtrl: ToastController,
        private http: HttpClient) {

        this.uid = params.data.uid;
        this.interlocutor = params.data.interlocutor.key;
        this.interlocutorToken = params.data.interlocutor.token

        // Get Chat Reference
        chatsProvider.getChatRef(this.uid, this.interlocutor)
            .then((chatRef: any) => {
                this.dbchat = this.af.list(chatRef);
                this.chats = this.af.list(chatRef);
            });
    }

    ionViewDidEnter() {
        this.content.scrollToBottom();
    }
    ionViewDidLoad() {
        this.admobFa.interstitial.config({ id: FN_INTERTITIEL_ID, isTesting: false });
        this.admobNa.interstitial.config({ id: NA_INTERTITIEL_ID, isTesting: false });

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

    sendMessage() {
        if (this.countClickSend >= NBR_CLICK) {
            this.launchInterstitiel();
        }
        if (this.message) {
            let chat = {
                from: this.uid,
                message: this.message,
                type: 'message',
                sendDate: Date()
            };
            this.dbchat.push(chat);
            this.sendNotification();
            this.message = "";
            this.facebook.logEvent("MessageSended");
            this.countClickSend++;
            this.content.scrollToBottom();
        }
    };

    sendPicture(fromCamera, fab: FabContainer) {
        fab.close();
        if (this.countClickSend >= NBR_CLICK) {
            this.launchInterstitiel();
        }
        let chat = { from: this.uid, type: 'picture', picture: null };
        this.userProvider.getPicture(fromCamera)
            .then((image) => {
                chat.picture = image;
                this.dbchat.push(chat);
                this.countClickSend++;
                this.content.scrollToBottom();
                this.sendNotification();
            }).catch(err => {

                // let alert = this.util.doAlert("Erreur", "Aucune image selectionné", "Ok");
                // alert.present();
                this.displayErrorImage();
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
    displayErrorImage() {
        let toast = this.toastCtrl.create({
            message: 'Aucune image selectionné',
            duration: 3000,
            position: 'bottom'
        });
        toast.present();
    }

    async sendNotification() {
        this.af.object(`/users/${this.uid}`).subscribe(user => {
            let name = user.fullName ? user.fullName : user.email
            let body = {
                "notification": {
                    "title": `Nouveau message de: ${name}`,
                    "body": `${this.message}`,
                    "sound": "default",
                    "click_action": "FCM_PLUGIN_ACTIVITY",
                    "icon": "fcm_push_icon"
                },
                "data": {
                    "param1": `${name}`,
                    "param2": `${this.message}`,
                    "param3": `${user.key}`
                },
                "to": this.interlocutorToken,//"/users/" + uid,
                "priority": "high",
                "restricted_package_name": ""
            }
            let options = new HttpHeaders().set('Content-Type', 'application/json');
            return this.http.post("https://fcm.googleapis.com/fcm/send", body, {
                headers: options.set('Authorization', 'key=AAAA9sqz8Ck:APA91bFaQbNDvSblgEJrXEmWMREAYNijfi-cavc7w1YEuvAJKjPC3py9KDIF9mzGEP8QOHyoD2Po6K_fo8vVPNXpOzAXxHo5h_bP4IpmDg2f3Lujqrk-BslD_0f-N46geA4-pXt_XXsGKVos-g9wwt0GTSo8aHJszg'),
            })
                .subscribe(a => {
                    console.log('notification sended');
                    console.log(a);
                });
        });



    }

}
