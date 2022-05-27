const competition = "Summer Competition 2021";

let currentEvent = "None";
let time = 3600;

if (window.location.href.includes("test")) {
    window.addEventListener('beforeunload', (event) => {
        if (currentEvent != "None") {
            event.preventDefault();

            event.returnValue = "";
        }
    });
}

function loadCompetition() {
    const localTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    const estMonth = Number(localTime.split("/")[0]);

    if (estMonth == 11) {
        userDoc.get().then((doc) => {
            for (let e = 1; e < 5; e++) {
                var eventE = doc.data()[`event${e}`];

                if (eventE != "None" && !eventE.includes("!")) {
                    _("competitions").innerHTML += `
                    <div>
                        → <a onclick="confirmTest('${eventE}')">${eventE}</a>
                    </div>
                `;
                }
            }

            if (doc.data()[`ctf`] != undefined) {
                if (doc.data()[`ctf`] == true) {
                    _("competitions").innerHTML += `
                    <div>
                        <a onclick="confirmTest('CTFSubmissions')">\> CTF Submissions</a>
                    </div>
                `;
                }
            }
        });
    }
}

function confirmTest(event) {
    if (["Capture The Flag", "Website Design", "Tech Support", "Programming Challenges", "Golf", "Web Scraping"].includes(event)) {
        window.location.href = `test.html?test=${event}`;
    } else if (confirm("Are you sure you want to begin this event? Once you start, the timer will start and you won't be able to pause or come back later!")) {
        window.location.href = `test.html?test=${event}`;
    }
}

var answers = new Map();

function loadTest(test) {
    if (["Capture The Flag", "Website Design", "Tech Support", "Programming Challenges", "Golf", "Web Scraping"].includes(test)) {
        _("submit-row").style.display = "none";
    }

    userDoc.get().then((doc) => {
        if (test != "CTFSubmissions") {
            if (Object.values(doc.data()).includes(test + "!")) {
                alert("Sorry, you already finished this test!");

                return window.location.href = "dashboard.html";
            } else if (!Object.values(doc.data()).includes(test)) {
                alert("Sorry, you don't have this event!");

                return window.location.href = "dashboard.html";
            } else if (!["Capture The Flag", "Website Design", "Tech Support", "Programming Challenges", "Golf", "Web Scraping"].includes(test)) {
                let data = {};

                let finishedEvent = Object.keys(doc.data()).find(key => doc.data()[key] === test);

                data[finishedEvent] = test + "!";

                userDoc.set(data, { merge: true }).then(() => {
                    sciolylog(`Successfully locked user in!`, `Event=User locked into test&UID=${user.uid}&Event=${test}`);
                }).catch((e) => {
                    sciolylog(`Error occurred locking user into test: ${e}`, `Event=Error occurred locking user into test&Error=${e}&UID=${user.uid}&Event=${test}`);
        
                    alert("Error occurred accessing database, please refresh the page and try again!");
                });
            }
        }
    });

    currentEvent = test;

    _("title").innerHTML = test;
    _("details").innerHTML = `UID: ${user.uid} | Time Remaining: 60 minutes and 0 seconds`;

    var testContainer = _("test-container");

    tests.doc(test).collection(competition).get().then((querySnapshot) => {
        var docs = [];

        querySnapshot.forEach((doc) => {
            docs[Number(doc.id.split("question")[1]) - 1] = doc;
        });

        var q = 0;

        docs.forEach((doc) => {
            if (q != 0) {
                testContainer.innerHTML += `<hr>`;
            }

            q++;

            const data = doc.data();

            switch (data.type) {
                case "mcq":
                    var question = `
                        <div class="question mcq">
                    `;

                    question += `
                            <div class="question-text">
                                ${q}. (${data.value} point${(data.value > 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer mcq-options">
                    `;

                    for (i in data.options) {
                        question += `
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="${doc.id}" id="${doc.id}-option${i}" value="${data.options[i]}" onchange="answer(this.id, this.value)">

                                    <label class="form-check-label" for="${doc.id}-option${i}">
                                        ${data.options[i]}
                                    </label>
                                </div>
                        `;
                    }

                    question += `
                            </div>
                        </div>
                    `;

                    testContainer.innerHTML += question;
                    break;
                case "msq":
                    var question = `
                        <div class="question msq">
                    `;

                    question += `
                            <div class="question-text">
                                ${q}. (${data.value} point${(data.value > 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer msq-options">
                    `;

                    for (i in data.options) {
                        question += `
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="${doc.id}option${i}" id="${doc.id}-moption${i}" value="${data.options[i]}" onchange="answer(this.id, this.value)">

                                    <label class="form-check-label" for="${doc.id}-moption${i}">
                                        ${data.options[i]}
                                    </label>
                                </div>
                        `;
                    }

                    question += `
                            </div>
                        </div>
                    `;

                    testContainer.innerHTML += question;
                    break;
                case "mq":
                    var question = `
                        <div class="question mq">
                    `;

                    question += `
                            <div class="question-text">
                                ${q}. (${data.value} point${(data.value > 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer mq-options-container">
                    `;

                    question += `
                                <div class="mq-optionsA">
                    `;

                    for (i in data.optionsA) {
                        question += `
                                    <div class="form-check">
                                        <input class="form-check-input mq-input" type="text" name="${doc.id}optionA${i}" id="${doc.id}-optionA${i}" maxlength="1" onchange="answer(this.id, this.value)">

                                        <label class="form-check-label" for="${doc.id}-optionA${i}">
                                            &nbsp;${data.optionsA[i]}
                                        </label>
                                    </div>
                        `;
                    }

                    question += `
                                </div>

                                <div class="mq-optionsB">
                    `;

                    for (i in data.optionsB) {
                        question += `
                                    <div class="form-check">
                                        ${Number(i) + 1}. ${data.optionsB[i]}
                                    </div>
                        `;
                    }

                    question += `
                                </div>
                            </div>
                        </div>
                    `;

                    testContainer.innerHTML += question;
                    break;
                case "lrq":
                    var question = `
                        <div class="question lrq">
                    `;

                    question += `
                            <div class="question-text">
                                ${q}. (${data.value} point${(data.value > 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer lrq-answer">
                    `;

                    question += `
                                <div class="form-group">
                                    <textarea class="form-control" id="${doc.id}-response" rows="5" onchange="answer(this.id, this.value)"></textarea>
                                </div>
                    `;
                    
                    question += `
                            </div>
                        </div>
                    `;  

                    testContainer.innerHTML += question;
                    break;
                case "fitb":
                    var question = `
                        <div class="question fitb">
                    `;

                    question += `
                            <div>
                                ${q}. (${data.value} point${(data.value > 1) ? "s" : ""})
                                &nbsp;
                                <label>${data.text.split("|~~~~|")[0]}</label>
                                <input type="text" class="fitb-answer" style="height: 30px" id="${doc.id}-blank" onchange="answer(this.id, this.value)">
                                <label>${data.text.split("|~~~~|")[1]}</label>
                            </div>
                    `;
                    
                    question += `
                        </div>
                    `;

                    testContainer.innerHTML += question;
                    break;
                default:
                    alert("An error occurred preparing the test! Please contact an officer for assistance!");
            }
        });
    }).then(() => {
        userDoc.collection("answers").doc(test).get().then((answersDoc) => {
            if (answersDoc.exists && ["Capture The Flag", "Website Design", "Tech Support", "Programming Challenges", "Golf", "Web Scraping"].includes(test)) {
                _("details").innerHTML = `UID: ${user.uid} | Deadline: November ${ test == "Capture The Flag" ? "15th" : "10th" }, 11:59 PM`;

                for (var a = 0; a < Object.keys(answersDoc.data()).length; a++) {
                    document.getElementById(`question${a + 1}-response`).value = answersDoc.data()[`question${a + 1}`];
                }
            } else {
                let startTime = (new Date()).getTime();

                userDoc.collection("answers").doc(currentEvent).set({
                    time: startTime
                }, { merge: true }).catch((e) => {
                    sciolylog(`Error occurred creating user answer sheet: ${e}`, `Event=Error occurred creating user answer sheet&Error=${e}&UID=${user.uid}&Event=${currentEvent}`);
                });

                setTimeout(() => {
                    timer();
                }, 1000);
            }
        });
    }).catch((error) => {
        sciolylog(`Error occurred retrieving test: ${error}`, `Event=Error occurred retrieving test&Error=${error}&UID=${user.uid}&Event=${test}`);
    });
}

function timer() {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;

    var timeText = `${minutes} minute${(minutes == 1) ? "" : "s"} and ${seconds} second${(seconds == 1) ? "" : "s"}`;
    
    _("details").innerHTML = `UID: ${user.uid} | Time Remaining: ${timeText}`;

    if (time % 90 == 0) {
        saveAnswers();
    }

    time -= 1;

    if (time <= 0) {
        submit(true);
    } else {
        return setTimeout(timer, 1000);
    }
}

var saved = false;
var saveTimestamp = 0;

function answer(id, answer) {
    if (id.includes("optionA")) {
        var answerList;

        if (answers.get(id.substr(0, id.indexOf("-"))) == undefined) {
            var answerList = [];
        } else {
            var answerList = answers.get(id.substr(0, id.indexOf("-")));
        }

        answerList[id.split("optionA")[1]] = answer;

        answers.set(id.substr(0, id.indexOf("-")), answerList);
    } else if (id.includes("moption")) {
        var answerlist;

        if (answers.get(id.substr(0, id.indexOf("-"))) == undefined) {
            answerList = [];
        } else {
            answerList = answers.get(id.substr(0, id.indexOf("-")));
        }

        if (_(id).checked) {
            answerList.push(answer);
        } else {
            answerList.splice(answerList.indexOf(answer), 1);
        }

        answers.set(id.substr(0, id.indexOf("-")), answerList);
    } else {
        answers.set(id.substr(0, id.indexOf("-")), answer);
    }

    saved = false;

    _("saveStatus").innerHTML = `Not Saved | <a onclick="manualSave()">Save</a>`;
}

function saveAnswers(finished = false) {
    const data = {};

    answers.forEach((answer, question) => {
        data[question] = answer.toString();
    });

    userDoc.collection("answers").doc(currentEvent).set(data, { merge: true }).then(() => {
        sciolylog(`Saved ${currentEvent} answers`, `Event=Saved answers&UID=${user.uid}&Event=${currentEvent}`);

        if (finished) {
            alert(`Successfully submitted the test!`);

            currentEvent = "None";

            window.location.href = "dashboard.html";
        } else {
            saved = true;
            saveTimestamp = (new Date()).getTime();

            _("saveStatus").innerHTML = `Saved at ${(new Date(saveTimestamp))}`;
        }
    }).catch((e) => {
        sciolylog(`Error occurred saving ${currentEvent} answers: ${e}`, `Event=Error occurred saving answers&Error=${e}&UID=${user.uid}&Event=${currentEvent}`);

        alert("Error occurred saving answers, please refresh the page and try again!");
    });
}

function manualSave() {
    if ((new Date()).getTime() - saveTimestamp > 30000) {
        saveAnswers();
    } else {
        alert(`Sorry, please wait ${Math.ceil((30000 - ((new Date()).getTime() - saveTimestamp))/1000)} more seconds before manually saving again!`);
    }
}

function submit(confirmed = false) {
    if (!confirmed || ["Capture The Flag", "Website Design", "Tech Support", "Programming Challenges", "Golf", "Web Scraping"].includes(currentEvent)) {
        if (!confirm("Are you sure you want to submit the test? You won't be able to access it again!")) {
            return;
        }
    }

    saveAnswers(true);

    sciolylog(`Submitted ${currentEvent} answers`, `Event=Submitted answers&UID=${user.uid}&Event=${currentEvent}`);
}

function testRedirect(dest) {
    if (["Capture The Flag", "Website Design", "Tech Support", "Programming Challenges", "Golf", "Web Scraping"].includes(currentEvent)) {
        submit(true);

        if (dest == "dashboard") {
            window.location.href = "dashboard.html";
        } else {
            if (firebase.auth().currentUser != null) {
                firebase.auth().signOut();
            }
    
            if (!window.location.href.includes("index.html") || window.location.href != "") {
                window.location.href = "index.html";
            }
        }
    } else if (confirm("Are you sure you want to exit the test? If you do, your answers will be saved and submitted!")) {
        submit(true);

        if (dest == "dashboard") {
            window.location.href = "dashboard.html";
        } else {
            if (firebase.auth().currentUser != null) {
                firebase.auth().signOut();
            }
    
            if (!window.location.href.includes("index.html") || window.location.href != "") {
                window.location.href = "index.html";
            }
        }
    }
}