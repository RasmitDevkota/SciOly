import {
    db,
    auth,
    _,
    sfsciolylog,
    securitycheck
} from "./script.js";

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js';

import {
    doc,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

export async function googleAuth(destination = "dashboard.html") {
    // let accessGranted = false;

    // if (confirm("Are you an officer? If not, please click 'Cancel' or hit the 'Esc' key to go back!")) {
    //     if (await securitycheck()) {
    //         accessGranted = true;
    //     }
    // }

    // if (!accessGranted) {
    //     return alert("Sorry, this functionality isn't available at this time!");
    // }

    signInWithPopup(auth, new GoogleAuthProvider()).then((result) => {
        sfsciolylog("Signed in!", `Event=User authenticated with Google&UID=${auth.currentUser.uid}`);

        uid = auth.currentUser.uid;
        userDoc = doc(db, "users", auth.currentUser.uid);

        result.user.providerData.forEach(async (profile) => {
            const username = profile.displayName;
            const email = profile.email;

            await getDoc(userDoc).then((_doc) => {
                if (!_doc.exists()) {
                    console.log("hi");
                    setDoc(doc(db, "emails", username), {
                        email: email,
                        uid: auth.currentUser.uid,
                        name: username
                    }).then(() => {
                        console.log("Emails document successfully written!");
                    }).catch((error) => {
                        console.error("Error writing emails document: ", error);
                    });

                    setDoc(doc(db, "users", auth.currentUser.uid), {
                        displayName: username,
                        email: email,
                        name: username,
                        assignments: {
                            "Tryouts 2023~~Codebusters~~0546609279": "Active"
                        }
                    }).then(() => {
                        console.log("Users document successfully written!");

                        window.location.href = destination;
                    }).catch((error) => {
                        console.error("Error writing users document: ", error);
                    });
                } else {
                    console.log("Docs already exist, skipped writing.");

                    window.location.href = destination;
                }
            });
        });
    }).catch((error) => {
        // @TODO - Include some form of identification from provider
        sfsciolylog(`Error occurred authenticating with Google: ${error}`, `Event=Error occurred authenticating with Google + password&Error=${error}&Credential=${GoogleAuthProvider.credentialFromError(error)}`);
    });
}

export function authenticate(_id, _password) {
    const id = id ?? _("si-ue").value;
    const password = _password ?? _("si-password").value;

    signInWithEmailAndPassword(auth, id, password).then(() => {
        sfsciolylog("Signed in!", `Event=User signed in with email + password&UID=${auth.currentUser.uid}`);

        window.location.href = "dashboard.html";
    }).catch((error) => {
        if (error.code == "auth/wrong-password") {
            signInWithEmailAndPassword(auth, id, password).then(() => {
                sfsciolylog("Signed in!", `Event=User signed in with username/email + password&UID=${auth.currentUser.uid}`);

                window.location.href = "dashboard.html";
            }).catch((error) => {
                sfsciolylog(`Error occurred signing in: ${error}`, `Event=Error occurred signing in with username/email + password&Error=${error}`);

                alert(`Error occurred: ${error.message}`);
            });
        } else {
            sfsciolylog(`Error occurred signing in: ${error}`, `Event=Error occurred signing in with username/email + password&Error=${error}`);

            alert(`Error occurred: ${error.message}`);
        }
    });
}

export function unAuthenticate() {
    if (confirm("Are you sure you want to log out?")) {
        if (auth.currentUser != null) {
            signOut(auth);
        }

        if (!window.location.href.includes("index.html") || window.location.href != "") {
            window.location.href = "index.html";
        }
    }
};
