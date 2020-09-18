import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Camera } from "@ionic-native/camera";
import { NativeStorage } from "@ionic-native/native-storage";

import { InAppBrowser } from "@ionic-native/in-app-browser";

import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";
import { ChatViewPage } from "../pages/chat-view/chat-view";
import { AccountPage } from "../pages/account/account";
import { ChatsPage } from "../pages/chats/chats";
import { TabsPage } from "../pages/tabs/tabs";
import { LoginPage } from "../pages/login/login";
import { UsersPage } from "../pages/users/users";
import { IonicStorageModule } from "@ionic/storage";

import { AngularFireAuthModule } from "angularfire2/auth";
import {
  AngularFireDatabaseModule,
  AngularFireDatabase,
} from "angularfire2/database";
import { AngularFireModule } from "angularfire2";
import { AuthProvider } from "../providers/auth-provider/auth-provider";
import { ChatsProvider } from "../providers/chats-provider/chats-provider";
import { UserProvider } from "../providers/user-provider/user-provider";
import { UtilProvider } from "../providers/utils";
import { Facebook } from "@ionic-native/facebook";
import { AdMobFree } from "@ionic-native/admob-free";

import { PipesModule } from "../custom/pipe.module";
import { ConfigProvider } from "../providers/config/config";
import { GooglePlus } from "@ionic-native/google-plus";

import { FCM } from "@ionic-native/fcm";

import { HttpClientModule } from "@angular/common/http";

export const firebaseConfig = {
  apiKey: "__your_api_key__",
  authDomain: "__your_auth_domain__",
  databaseURL: "__your_database_url__",
  projectId: "__your_project_Id__",
  storageBucket: "____your_storage_bucket__",
  messagingSenderId: "____your_messagingSenderId__",
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    LoginPage,
    UsersPage,
    ChatsPage,
    AccountPage,
    ChatViewPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    IonicStorageModule.forRoot(),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    PipesModule,
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage,
    LoginPage,
    UsersPage,
    ChatsPage,
    AccountPage,
    ChatViewPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthProvider,
    AngularFireDatabase,
    ChatsProvider,
    UserProvider,
    UtilProvider,
    Camera,
    NativeStorage,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Facebook,
    GooglePlus,
    FCM,
    AdMobFree,
    InAppBrowser,
    ConfigProvider,
  ],
})
export class AppModule {}
