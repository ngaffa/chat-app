import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import { UserProvider } from '../user-provider/user-provider';

@Injectable()
export class ChatsProvider {
    constructor(public afdb: AngularFireDatabase, public up: UserProvider) { }
    // get list of Chats of a Logged In User
    getChats() {
        return this.up.getUid().then(uid => {
            let chats = this.afdb.list(`/users/${uid}/chats`);
            return chats;
        });
    }

    // Add Chat References to Both users
    addChats(uid, interlocutor) {
        // First User
        let endpoint = this.afdb.object(`/users/${uid}/chats/${interlocutor}`);
        endpoint.set(true);

        // Second User
        let endpoint2 = this.afdb.object(`/users/${interlocutor}/chats/${uid}`);
        endpoint2.set(true);
    }

    getChatRef(uid, interlocutor) {
        let firstRef = this.afdb.object(`/chats/${uid},${interlocutor}`);
        let promise = new Promise((resolve, reject) => {
            firstRef.subscribe(snapshot => {
                console.log(snapshot);
                let a = snapshot.$exists();
                if (a) {
                    resolve(`/chats/${uid},${interlocutor}`);
                } else {
                    let secondRef = this.afdb.object(`/chats/${interlocutor},${uid}`);
                    secondRef.subscribe(snapshot => {
                        let b = snapshot.$exists();
                        if (!b) {
                            this.addChats(uid, interlocutor);
                        }
                    });
                    resolve(`/chats/${interlocutor},${uid}`);
                }
            });
        });

        return promise;
    }
}

