import {
    db,
    auth,
    _,
    sfsciolylog
} from "./script.js";

import {
    doc,
    collection,
    getDoc,
    getDocs,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

const settings = new Map();

export async function loadSettings() {
    getDoc(doc(db, "users", auth.currentUser.uid)).then((_doc) => {
        settings.set("contactEmail", _doc.data()["contactEmail"] ?? "");
        document.getElementById("contactEmailInput").value = _doc.data()["contactEmail"];
    });
}

export function cancelSettingsChanges() {
    document.getElementById("contactEmailInput").value = settings["contactEmail"];

    alert("Cancelled all unsaved changes!");
}

export function saveSettingsChanges() {
    if (!(new RegExp(`.*@.*\..*`).test(document.getElementById("contactEmailInput").value))) {
        return alert("Please make sure you've entered a valid email!");
    }

    if (document.getElementById("contactEmailInput").value.includes("@forsyth")) {
        return alert("Sorry, you can't use your school email for the Contact Email! Please enter a personal email!");
    }

    setDoc(userDoc, {
        contactEmail: document.getElementById("contactEmailInput").value,
    }, { merge: true }).then(() => {
        alert("Successfuly saved settings!");
    }).catch((e) => {
        alert("Could not save settings! Please contact an officer and/or try again later.");

        console.error(e);
    });
}