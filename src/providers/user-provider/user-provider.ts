import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { NativeStorage } from '@ionic-native/native-storage';
import { Storage as IonicStorage } from '@ionic/storage';
import { Platform } from 'ionic-angular';

import * as firebase from 'firebase/app';
@Injectable()
export class UserProvider {

    updateUserInfo(uid: string) {

        let userRef = this.afdb.object(`/users/${uid}`, { preserveSnapshot: true });
        userRef.subscribe(async user => {
            console.log(user);
            console.log(user.val());

            if (user.val()) {
                let pic = user.val().picture;
                let token = user.val().token;
                if (pic.indexOf("google") > -1) {
                    let newValue = pic.replace("/s96-c/", "/s300-c/");
                    if (newValue != pic) {
                        let pictureUserRef = this.afdb.object(`/users/${uid}/picture`);
                        pictureUserRef.set(newValue);
                    }
                }
                else if (pic.indexOf("facebook") > -1) {
                    let newValue = pic + "?height=500";
                    if (newValue != pic) {
                        let pictureUserRef = this.afdb.object(`/users/${uid}/picture`);
                        pictureUserRef.set(newValue);
                    }
                }

                let currenttoken = await this.getToken();
                if (currenttoken != token) {
                    let tokenUserRef = this.afdb.object(`/users/${user.uid}/token`);
                    tokenUserRef.set(currenttoken);
                    console.log('User does exist');
                }


            }
        })

    }
    constructor(public afdb: AngularFireDatabase, public storage: NativeStorage, public local: IonicStorage,
        public cmr: Camera,
        public platform: Platform) { }

    // Get Current User's UID
    getUid() {
        if (this.platform.is('android'))
            return this.storage.getItem('uid');
        else
            return this.local.get('uid');
    }

    // Get Current User's Token
    getToken() {
        if (this.platform.is('android'))
            return this.storage.getItem('token');
        else
            return this.local.get('token');
    }

    // Set Current User's token
    setToken(token) {
        if (this.platform.is('android'))
            this.storage.setItem('token', token);
        else this.local.set('token', token);
    }

    // Create User in Firebase
    async createUser(userCredentails, uid) {
        let token = await this.getToken();
        let currentUserRef = this.afdb.object(`/users/${uid}`);
        console.log(userCredentails);
        currentUserRef.set({ email: userCredentails.email, key: uid, token: token, enabled: true });
    }

    // Create User in Firebase
    async createUserFromFacebook(user) {
        let token = await this.getToken();
        let currentUserRef = this.afdb.object(`/users/${user.uid}`, { preserveSnapshot: true });
        currentUserRef.subscribe(data => {
            console.log("user exist ?");
            console.log(data.val());
            if (data.val() !== null) {
                let tokenUserRef = this.afdb.object(`/users/${user.uid}/token`);
                tokenUserRef.set(token);
                console.log('User does exist');
            } else {
                console.log('User does not exist');
                currentUserRef.set({ email: user.email, key: user.uid, fullName: user.displayName, picture: user.photoURL + "?height=500", token: token, enabled: true });
            }
        });


    }

    // Create User in Firebase
    async createUserFromGoogle(user) {
        let token = await this.getToken();

        let currentUserRef = this.afdb.object(`/users/${user.uid}`, { preserveSnapshot: true });
        currentUserRef.subscribe(data => {
            console.log("user exist ?");
            console.log(data.val());
            if (data.val() !== null) {
                let tokenUserRef = this.afdb.object(`/users/${user.uid}/token`);
                tokenUserRef.set(token);
                console.log('User does exist');
            } else {
                console.log('User does not exist');
                let photo = user.photoURL.replace("/s96-c/", "/s300-c/");
                currentUserRef.set({ email: user.email, key: user.uid, fullName: user.displayName, picture: photo, token: token, enabled: true });
            }
        });


    }

    async updateUserTokenForCredentialSignin(uid) {
        let token = await this.getToken();

        let tokenUserRef = this.afdb.object(`/users/${uid}/token`);
        tokenUserRef.set(token);
        console.log('User does exist');
    }

    // Get Info of Single User
    getUser() {
        // Getting UID of Logged In User
        return this.getUid().then(uid => {
            return this.afdb.object(`/users/${uid}`);
        });
    }


    // Get All Users of App
    getAllUsers() {
        firebase.database().goOnline();
        return this.afdb.list('/users');
    }

    // Get base64 Picture of User
    getPicture(fromCamera: boolean = false) {
        let base64Picture;
        const options: CameraOptions = {
            // quality: 100,
            destinationType: this.cmr.DestinationType.DATA_URL,
            encodingType: this.cmr.EncodingType.JPEG,
            mediaType: this.cmr.MediaType.PICTURE,
            sourceType: fromCamera ? this.cmr.PictureSourceType.CAMERA : this.cmr.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true

        }

        let promise = new Promise((resolve, reject) => {
            this.cmr.getPicture(options).then((imageData) => {
                base64Picture = "data:image/jpeg;base64," + imageData;
                resolve(base64Picture);
            }, (error) => {
                reject(error);
            });

        });
        return promise;
    }

    // Update Provide Picture of User
    updatePicture() {
        this.getUid().then(uid => {
            let pictureRef = this.afdb.object(`/users/${uid}/picture`);
            this.getPicture()
                .then((image) => {
                    pictureRef.set(image);
                }, err => console.log(err));
        });
    }

    saveFullName(fullName: string) {
        if (!fullName)
            return;
        this.getUid().then(uid => {
            let fullNameref = this.afdb.object(`/users/${uid}/fullName`);
            fullNameref.set(fullName);
        });
    }
}

