import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";

import {
    getAnalytics
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-analytics.js';

import {
    getFirestore,
    collection,
    doc,
    enableIndexedDbPersistence
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

import {
    getAuth,
    setPersistence,
    browserSessionPersistence,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js';

const app = initializeApp({
    apiKey: "AIzaSyBw7h-5dzK9tcbKCbzWdo35Dlbi1L7It_M",
    authDomain: "sfhsscioly.firebaseapp.com",
    projectId: "sfhsscioly",
    storageBucket: "sfhsscioly.appspot.com",
    messagingSenderId: "349064681600",
    appId: "1:349064681600:web:cbc2b49364eec7a5882e65",
    measurementId: "G-QFKK2189G7"
});

const analytics = getAnalytics(app);

export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((error) => {
    if (error.code == 'failed-precondition') {
        console.log("Other tabs open, cannot enable Indexed DB Persistence");
    } else if (error.code == 'unimplemented') {
        console.log("Browser does not support Indexed DB Persistence");
    }
});

export const users = collection(db, "users");
export const tests = collection(db, "tests");

window.userDoc = null;

export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);

export function test() {
    console.log(auth.currentUser.uid);
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        pageLoad(true);
    } else {
        pageLoad(false);
    }
});

function pageLoad(user) {
    if (user) {
        if (!auth.currentUser) {
            sfsciolylog("Auth error occurred, pageLoad(true) called even though auth.currentUser is " + auth.currentUser, "Event=False Auth State Change");

            pageLoad(false);
        }

        userDoc = doc(db, "users", auth.currentUser.uid);

        if (window.location.href.includes("index.html")) {
            window.location.href = "dashboard.html";
        } else if (window.location.href.includes("dashboard.html")) {
            _("welcome-user").innerHTML = `Welcome, ${auth.currentUser.displayName ?? "User"}!`;

            loadAssignments();
        } else if (window.location.href.includes("test.html")) {
            const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
            const test = urlParams.get('test');

            loadAssignment(test);
        }
    } else {
        if (window.location.href.includes("dashboard.html") || window.location.href.includes("test.html")) {
            window.location.href = "index.html";
        }
    }
}

export function _(id) {
    return document.getElementById(id);
}

export function sfsciolylog(msg, log = "") {
    try {
        var details = "";

        if (log == "" || log == "<~") {
            details = `Message=${msg.replace(/ /g, "__")}`;
        } else {
            details = log.replace(/<~/g, msg).replace(/ /g, "__");
        }

        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `https://sfscioly-discord-bot.dralientech.repl.co/log?${details}`, true);
        xhttp.send();
    } catch (error) {
        console.error("Logging error:", error);
    } finally {
        console.log(msg);
    }
}
