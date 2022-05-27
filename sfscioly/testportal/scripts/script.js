import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-analytics.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js'
import { getFirestore }from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js'

const app = initializeApp({
    apiKey: "AIzaSyBw7h-5dzK9tcbKCbzWdo35Dlbi1L7It_M",
    authDomain: "sfhsscioly.firebaseapp.com",
    projectId: "sfhsscioly",
    storageBucket: "sfhsscioly.appspot.com",
    messagingSenderId: "349064681600",
    appId: "1:349064681600:web:cbc2b49364eec7a5882e65",
    measurementId: "G-QFKK2189G7"
});

console.log(getAnalytics);

const db = getFirestore(app);
db.enablePersistence();

const users = db.collection("users");
const tests = db.collection("tests");

auth.auth().onAuthStateChanged(u => {
    if (u != null || u != undefined) {
        pageLoad(true);
    } else {
        pageLoad(false);
    }
});

function pageLoad(u) {
    if (u) {
        window.user = firebase.auth().currentUser;

        if (!user) {
            sciolylog("Auth error occurred, pageLoad(true) called even though firebase.auth().currentUser is " + user, "Event=False Auth State Change");

            pageLoad(false);
        }

        window.userDoc = users.doc(user.uid);

        if (window.location.href.includes("index.html")) {
            window.location.href = "dashboard.html";
        } else if (window.location.href.includes("dashboard.html")) {
            _("welcome-user").innerHTML = `Welcome, ${getCookie("username")}!`;

            loadCompetition();
        } else if (window.location.href.includes("test.html")) {
            const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
            const test = urlParams.get('test');

            loadTest(test);
        }
    } else {
        if (!window.location.href.includes("index.html") && window.location.href != "") {
            window.location.href = "index.html";
        }
    }
}

function _(id) {
    return document.getElementById(id);
}

function display(id) {
    $('#' + id).toggle();
}

function sciolylog(msg, log = "") {
    try {
        var details = "";

        if (log == "" || log == "<~") {
            details = `Message=${msg.replace(/ /g, "__")}`;
        } else {
            details = log.replace(/<~/g, msg).replace(/ /g, "__");
        }

        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `https://scioly-discord-bot.dralientech.repl.co/log?${details}`, true);
        xhttp.send();
    } catch (error) {
        console.error(error);
    } finally {
        console.log(msg);
    }
}