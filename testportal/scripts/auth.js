function auth() {
    let id = _("si-ue").value;
    const pwd = _("si-password").value;

    firebase.auth().signInWithEmailAndPassword(id, pwd).then(() => {
        sciolylog("Signed in!", `Event=User signed in with email + password & UID=${firebase.auth().currentUser.uid}`);

        window.location.href = "dashboard.html";
    }).catch((error) => {
        if (error.code == "auth/wrong-password") {
            // get email from username, and then...

            firebase.auth().signInWithEmailAndPassword(id, pwd).then(() => {
                sciolylog("Signed in!", `Event=User signed in with username/email + password&UID=${firebase.auth().currentUser.uid}`);

                window.location.href = "dashboard.html";
            }).catch((error) => {
                sciolylog(`Error occurred signing in: ${error}`, `Event=Error occurred signing in with username/email + password&Error=${error}`);

                alert(`Error occurred: ${error.message}`);
            });
        } else {
            sciolylog(`Error occurred signing in: ${error}`, `Event=Error occurred signing in with username/email + password&Error=${error}`);

            alert(`Error occurred: ${error.message}`);
        }
    });
}

function signUp() {
	let email = _("su-email").value;
	var username = _("su-username").value;
	var fName = _("su-firstname").value;
	var lName = _("su-lastname").value;
    var pwd = _("su-pwd").value;

    firebase.auth().createUserWithEmailAndPassword(emailC, hashed).then(function () {
        firebase.auth().signInWithEmailAndPassword(emailC, hashed).then(() => {
            sciolylog("Signed in!", `Event=User signed up and in with username/email + password&UID=${firebase.auth().currentUser.uid}`);

            alert(usr);
        }).catch(function (error) {
            sciolylog(`Error occurred signing in: ${error}`, `Event=Error occurred signing in after up with username/email + password&Error=${error}&Username=${user}&Email=${emailC}`);
        });
    }).catch((error) => {
        sciolylog(`Error occurred signing up: ${error}`, `Event=Error occurred signing up with username/email + password&Error=${error}&Username=${user}&Email=${emailC}`);
    });
}

function unauth() {
    if (confirm("Are you sure you want to log out?")) {
        if (firebase.auth().currentUser != null) {
            firebase.auth().signOut();
        }

        if (!window.location.href.includes("index.html") || window.location.href != "") {
            window.location.href = "index.html";
        }
    }
};

function sendPasswordReset() {
    var email = _('premail');
    
    if (email != null) {
        firebase.auth().sendPasswordResetEmail(email).then(function () {
            alert('Password reset email sent!');
        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode == 'auth/invalid-email') {
                alert(errorMessage);
            } else if (errorCode == 'auth/user-not-found') {
                alert(errorMessage);
            }

            sciolylog(`Error occurred sending password reset email: ${error}`, `Event=Error occurred sending password reset email&Error=${error}&Email=${email}`);
        });
    } else {
        alert("Please enter an email.");
    }
};

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";

    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    return retVal;
}