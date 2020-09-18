import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { NativeStorage } from '@ionic-native/native-storage';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';





@Injectable()
export class AuthProvider {
  constructor(public afat: AngularFireAuth, public storage: NativeStorage, public platform: Platform, public googlePlus: GooglePlus) { }

  signin(credentails) {
    console.log(credentails);
    return this.afat.auth.signInWithEmailAndPassword(credentails.email, credentails.password);
  }

  signInWithFacebook() {

    return this.afat.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

  }

  signInWithGoogle() {
    let promise = new Promise<any>((resolve, reject) => {
      this.googlePlus.login({
        'webClientId': '1059962744873-588hnrep9ftrc6cue7ad8l142e9fn1qh.apps.googleusercontent.com',
        'offline': true
      }).then(res => {
        const googleCredential = firebase.auth.GoogleAuthProvider
          .credential(res.idToken);

        firebase.auth().signInWithCredential(googleCredential)
          .then(response => {
            console.log("Firebase success: " + JSON.stringify(response));
            resolve(response);
          }, (error) => {
            reject(error)
          });
      }, (error) => {
        reject(error)
      });

    });

    return promise;

  }

  createAccount(credentails) {


    return this.afat.auth.createUserWithEmailAndPassword(credentails.email, credentails.password);
  };

  logout() {
    if (this.platform.is('android'))
      this.storage.remove('uid');
    firebase.database().goOffline();
    this.afat.auth.signOut();//.then(p => console.log(p)).catch(e => console.log(e));
  }
}

