firebase.initializeApp({
    apiKey: "AIzaSyAPTvz8weUBIMyjl6ekC1uegX-j4u2Z1sc",
    authDomain: "cssa-dev.firebaseapp.com",
    databaseURL: "https://cssa-dev-default-rtdb.firebaseio.com",
    projectId: "cssa-dev",
    storageBucket: "cssa-dev.appspot.com",
    messagingSenderId: "921024173703",
    appId: "1:921024173703:web:46f4a35d815964ddf44a22",
    measurementId: "G-WBN11JNGTN"
});

firebase.analytics();

var db = firebase.firestore();
db.enablePersistence();

const users = db.collection("users");
const tests = db.collection("tests");

firebase.auth().onAuthStateChanged((u) => {
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
            cssalog("Auth error occurred, pageLoad(true) called even though firebase.auth().currentUser is " + user, "Event=False Auth State Change");

            pageLoad(false);
        }

        window.userDoc = users.doc(user.uid);

        if (window.location.href.includes("index.html")) {
            window.location.href = "dashboard.html";
        } else if (window.location.href.includes("dashboard.html")) {
            _("welcome-user").innerHTML = `Welcome, ${getCookie("username")}!`;

            loadCompetition();
        } else if (window.location.href.includes("test.html")) {
            var urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
            var test = urlParams.get('test');

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

function setCookie(name,value,days) {
    var expires = "";

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }

    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";

    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);

        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }

    return null;
}

function eraseCookie(name) {   
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function cssalog(msg, log = "") {
    try {
        var details = "";

        if (log == "" || log == "<~") {
            details = `Message=${msg.replace(/ /g, "__")}`;
        } else {
            details = log.replace(/<~/g, msg).replace(/ /g, "__");
        }

        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", `https://cssa-discord-bot.dralientech.repl.co/log?${details}`, true);
        xhttp.send();
    } catch (error) {
        console.error(error);
    } finally {
        console.log(msg);
    }
}