import { UserProvider } from "./../providers/user-provider/user-provider";

import { Component } from "@angular/core";
import { Platform, ToastController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import { AngularFireAuth } from "angularfire2/auth";
import { TabsPage } from "../pages/tabs/tabs";
import { LoginPage } from "../pages/login/login";
import { AdMobFree } from "@ionic-native/admob-free";
import { FN_BANNER_ID } from "../providers/config/config";
import { Events } from "ionic-angular";

import { FCM } from "@ionic-native/fcm";
@Component({
  templateUrl: "app.html",
})
export class MyApp {
  rootPage: any = LoginPage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public af: AngularFireAuth,
    public admobFa: AdMobFree,
    private toastCtrl: ToastController,
    private fcm: FCM,
    private userProvider: UserProvider,
    public events: Events
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.admobFa.banner.config({ id: FN_BANNER_ID, isTesting: false });
      this.admobFa.banner.prepare().then(
        () => {
          this.admobFa.banner.show();
        },
        (err) => this.displayErrorInterstitieBanner()
      );
      this.intialize();

      // this.fcm.subscribeToTopic('chats');
      this.fcm.getToken().then((token) => {
        console.log(token);
        this.userProvider.setToken(token);
      });
      this.fcm.onNotification().subscribe((data) => {
        if (data.wasTapped) {
          // this.events.publish('notification:received', data.param3);
        } else {
          console.log("Received in foreground");

          if (data.firebase) {
            this.displayNotification("chat-app", data.messages);
          } else {
            this.displayNotification(data.param1, data.param2);
            this.events.publish("notification:received", data.param3);
          }
        }
      });
      this.fcm.onTokenRefresh().subscribe((token) => {
        this.userProvider.setToken(token);
      });
    });
  }
  displayErrorInterstitieBanner() {
    let toast = this.toastCtrl.create({
      message: "Impossible de charger l'annonce",
      duration: 3000,
      position: "bottom",
    });
    toast.present();
  }
  displayNotification(name: string, message: string) {
    let toast = this.toastCtrl.create({
      message: `${name} : ${message}`,
      duration: 15000,
      position: "top",
    });
    toast.present();
  }
  intialize() {
    this.af.authState.subscribe((auth) => {
      if (auth) {
        console.log("auth uid");
        console.log(auth);
        this.userProvider.updateUserInfo(auth.uid);
        this.rootPage = TabsPage;
      } else {
        this.rootPage = LoginPage;
      }
    });
  }
}
