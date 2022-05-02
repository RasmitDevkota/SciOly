firebase.initializeApp({
    apiKey: "AIzaSyBVT22t-x2H76119AHG8SgPU0_A0U-N1uA",
    authDomain: "my-scrap-project.firebaseapp.com",
    databaseURL: "https://my-scrap-project.firebaseio.com",
    projectId: "my-scrap-project",
    storageBucket: "my-scrap-project.appspot.com",
    messagingSenderId: "334998588870",
    appId: "1:334998588870:web:6b218e9655ade3a6c536c7",
    measurementId: "G-66W8QQ9W35"
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

function sciolylog(msg, log = "") {
    try {
        var details = "";

        if (log == "" || log == "<~") {
            details = `Message=${msg.replace(/ /g, "__")}`;
        } else {
            details = log.replace(/<~/g, msg).replace(/ /g, "__");
        }

        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", `https://scioly-discord-bot.dralientech.repl.co/log?${details}`, true);
        xhttp.send();
    } catch (error) {
        console.error(error);
    } finally {
        console.log(msg);
    }
}