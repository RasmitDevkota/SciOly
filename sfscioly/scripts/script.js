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
    getDoc,
    enableIndexedDbPersistence
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

import {
    getAuth,
    setPersistence,
    browserSessionPersistence,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js';

import {
    loadAssignmentsToManage
} from './assignmentmanager.js';

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

window.uid = "";
window.userDoc = null;

export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);

onAuthStateChanged(auth, () => {
    pageLoad();
});

export function pageLoad() {
    if (auth.currentUser) {
        uid = auth.currentUser.uid;
        userDoc = doc(db, "users", auth.currentUser.uid);

        const page = window.location.href.split("?")[0];

        if (page.includes("index")) {
            window.location.href = "dashboard.html";
        } else if (page.includes("dashboard")) {
            _("welcome-user").innerHTML = `Welcome, ${auth.currentUser.displayName ?? "User"}!`;

            loadAssignments();
        } else if (page.includes("test")) {
            const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
            const test = urlParams.get('test');

            loadAssignment(test);
        } else if (page.includes("assignmentmanager")) {
            loadAssignmentsToManage();
        } else if (page.includes("settings")) {
            loadSettings();
        }
    } else {
        if (window.location.href.split("?")[0].includes("dashboard") || window.location.href.split("?")[0].includes("test")) {
            window.location.href = "index.html";
        }
    }
}

export function _(id) {
    return document.getElementById(id);
}

export function sfsciolylog(msg, log = "") {
    return;

    try {
        var details = "";

        if (log == "" || log == "<~") {
            details = `Message=${msg.replace(/ /g, "__")}`;
        } else {
            details = log.replace(/<~/g, msg).replace(/ /g, "__");
        }

        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `https://SFSciOlyBot.dralientech.repl.co/log?${details}`, true);
        xhttp.send();
    } catch (error) {
        console.error("Logging error:", error);
    } finally {
        console.log(msg);
    }
}

export async function securitycheck(input) {
    let attempts = 3;

    while (attempts > 0) {
        const key = prompt(`Please enter the admin key!`);
        const keyEncoded = new TextEncoder().encode(key);

        const keyHashed = Array.from(new Uint8Array(await window.crypto.subtle.digest('SHA-512', keyEncoded))).map(b => b.toString(16).padStart(2, '0')).join('');

        if (keyHashed == "23fa162648b894edfcc95b7405ac44f79c1654fb052dcda4777ae0024cf55f9c465b6a560550e7dea47dcbcfeb3608eb74a3b9117508b4bef7fc962019ea04e0") {
            alert("Access granted!");
            
            return true;
        } else {
            alert(`Key '${key}' incorrect! You have ${--attempts} remaining!`);
        }
    }

    if (attempts <= 0) {
        alert(`Too many incorrect attempts! Please try again later.`);

        return false;
    }
}
