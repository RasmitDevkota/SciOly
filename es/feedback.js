import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-firestore.js';
import { db } from './script.js';

window.addEventListener("load", () => {
    var urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
    var query = urlParams.get('query');

    var filters = [];

    urlParams.forEach((value, key) => {
        if (key == "competition") {
            window.competition = value;
        } else if (key == "event") {
            window.event = value;
        } else if (key == "division") {
            window.divsion = value;
        }
    });
});

document.getElementById('feedbackSubmit').addEventListener('click', submit);

async function submit(competition = "", event = "", division = "") {
    var competed = "";
    var id = document.getElementById("id").value;
    var neww = "";
    var difficulty = document.getElementById("difficultyRange").value;
    var quality = document.getElementById("qualityRange").value;
    var issues = document.getElementById("issues").value;
    var thoughts = document.getElementById("thoughts").value;
    var criticism = document.getElementById("criticism").value;
    var fun = "";

    if (id == "") {
        id = new Date().getTime();
    }

    if (competition == "") {
        competition = window.competition;
    }

    if (event == "") {
        event = window.event;
    }

    if (document.getElementById("competedYes").checked) {
        competed = "yes";
    } else if (document.getElementById("competedNo").checked) {
        competed = "no";
    }

    if (document.getElementById("firstYes").checked) {
        neww = "yes";
    } else if (document.getElementById("firstNo").checked) {
        neww = "no";
    }

    if (document.getElementById("funYes").checked) {
        fun = "yes";
    } else if (document.getElementById("funNo").checked) {
        fun = "no";
    }

    console.log(id, competed, neww, difficulty, quality, issues, thoughts, criticism, fun);

    var responseDocRef = doc(db, "competitions", `${window.competition}`, `${window.event + division}`, `${id}`);
    var responseDoc = await getDoc(responseDocRef);

    if (responseDoc.exists()) {
        console.log(`Duplicate submission`);

        return alert(`Based on your name/team name/team ID, it looks like you've already submitted this form!`
                    + `If you think this is a mistake, or if you would like to resubmit feedback, you may contact me at rdatch101@gmail.com.`);
    } else {
        await setDoc(responseDocRef, {
            id: id,
            competed: competed,
            new: neww,
            difficulty: difficulty,
            quality: quality,
            issues: issues,
            thoughts: thoughts,
            criticism: criticism,
            fun: fun
        }).then(function () {
            console.log(`Successfully submitted feedback!`);

            return alert(`Successfully submitted feedback! Thank you for your time!`);
        }).catch(function (e) {
            console.error(e);

            return alert("Error occurred! Please contact a developer!");
        });
    }
}