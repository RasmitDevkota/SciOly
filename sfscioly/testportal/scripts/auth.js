import {
    db,
    auth,
    _,
    sfsciolylog
} from "./script.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    signOut,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js';

import {
    doc,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

export function authenticate() {
    let id = _("si-ue").value;
    const password = _("si-password").value;

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

export function signUp() {
	let email = _("su-email").value;
	var username = _("su-username").value;
	var fName = _("su-firstname").value;
	var lName = _("su-lastname").value;
    var password = _("su-password").value;

    createUserWithEmailAndPassword(auth, email, password).then(() => {
        signInWithEmailAndPassword(auth, email, password).then(() => {
            sfsciolylog("Signed in!", `Event=User signed up and in with username/email + password&UID=${auth.currentUser.uid}`);

            setDoc(doc(db, "emails", username), {
                email: email,
                uid: user.uid,
                name: `${fName} ${lName}`
            }).then(() => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });

            setDoc(doc(db, "users", auth.currentUser.uid), {
                displayName: username,
                email: email,
                name: `${fName} ${lName}`
            }).then(() => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });

            updateProfile(auth.currentUser, {
                displayName: username,
            }).then(() => {
                console.log(user.displayName);
            }).catch((error) => {
                console.log(error);
                console.log(user.displayName);
            });
        }).catch(function (error) {
            sfsciolylog(`Error occurred signing in: ${error}`, `Event=Error occurred signing in after up with username/email + password&Error=${error}&Username=${username}&Email=${email}`);
        });
    }).catch((error) => {
        sfsciolylog(`Error occurred signing up: ${error}`, `Event=Error occurred signing up with username/email + password&Error=${error}&Username=${username}&Email=${email}`);
    });
}

export function googleAuth() {
    signInWithPopup(auth, new GoogleAuthProvider()).then((result) => {
        sfsciolylog("Signed in!", `Event=User authenticated with Google&UID=${auth.currentUser.uid}`);

        userDoc = doc(db, "users", auth.currentUser.uid);

        result.user.providerData.forEach(async (profile) => {
            var username = profile.displayName;
            var email = profile.email;

            const docSnap = await getDoc(userDoc);

            console.log(docSnap.exists());

            getDoc(userDoc).then((_doc) => {
                if (!_doc.exists()) {
                    setDoc(doc(db, "emails", username), {
                        email: email,
                        uid: auth.currentUser.uid,
                        name: username
                    }).then(() => {
                        console.log("Document successfully written!");
                    }).catch((error) => {
                        console.error("Error writing document: ", error);
                    });

                    setDoc(userDoc, {
                        displayName: username,
                        email: email,
                        name: username
                    }).then(() => {
                        console.log("Document successfully written!");
                    }).catch((error) => {
                        console.error("Error writing document: ", error);
                    });
                } else {
                    console.log("Emails doc already exists, skipped writing.");
                }
            });
        });
    }).catch((error) => {
        // @TODO - Include some form of identification from provider
        sfsciolylog(`Error occurred authenticating with Google: ${error}`, `Event=Error occurred authenticating with Google + password&Error=${error}&Credential=${GoogleAuthProvider.credentialFromError(error)}`);
    });
}

export function sendPasswordReset() {
    var email = _('premail');

    if (email != null) {
        sendPasswordResetEmail(auth, email).then(function () {
            alert('Password reset email sent!');
        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode == 'auth/invalid-email') {
                alert(errorMessage);
            } else if (errorCode == 'auth/user-not-found') {
                alert(errorMessage);
            }

            sfsciolylog(`Error occurred sending password reset email: ${error}`, `Event=Error occurred sending password reset email&Error=${error}&Email=${email}`);
        });
    } else {
        alert("Please enter an email.");
    }
};
