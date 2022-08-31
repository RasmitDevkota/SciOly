import {
    auth,
    db,
    _,
    sfsciolylog,
} from "./script.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

let assignmentId;
let eventName;
let assignmentName;
let assignmentSpecifier;
let assignmentCollection;
let assignmentSubmissionDoc;

const questions = new Array();

let time = 3000;

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

let mode = "";

// @TODO - This piece of code likely does not run, needs to be verified
if (window.location.href.includes("sfscioly.web.app/test")) {
    window.addEventListener('beforeunload', (event) => {
        if (eventName != "None") {
            event.preventDefault();

            event.returnValue = "";
        }
    });
}

export function loadAssignments() {
    getDoc(userDoc).then((doc) => {
        if (!doc.exists()) {
            console.log("Error!");
        }

        if (doc.data()["assignments"]) {
            Object.keys(doc.data()["assignments"]).forEach((_assignmentId) => {
                const status = doc.data()["assignments"][_assignmentId];

                if (status != "Complete") {
                    const assignmentDetails = _assignmentId.split("~~");
                    assignmentId = _assignmentId;
                    eventName = assignmentDetails[0];
                    assignmentName = assignmentDetails[1];

                    if (status == "Active") {
                        // @TODO - Display deadline if applicable
                        document.getElementById("assignments").innerHTML += `
                            <div>
                                → <a onclick="confirmOpenAssignment('${assignmentId}')">${eventName} - ${assignmentName}</a>
                            </div>
                        `;
                    } else if (status == "Upcoming") {
                        // @TODO - Display opening time
                        document.getElementById("assignmentsUpcoming").innerHTML += `
                            <div>
                                → <a onclick="alert('This assignment is not open yet! If the opening time has passed already, you'll have to refresh the page to access it.');">${eventName} - ${assignmentName}</a>
                            </div>
                        `;
                    } else if (status == "Graded") {
                        document.getElementById("assignmentsGraded").innerHTML += `
                            <div>
                                → <a onclick="openGradedAssignment('${assignmentId}')">${eventName} - ${assignmentName}</a>
                            </div>
                        `;
                    }
                }
            });
        }
    });
}

export function confirmOpenAssignment(assignmentId) {
    // @TODO - Check if test is mandatory
    if (confirm("Are you sure you want to begin this event? Once you start, the timer will start and you won't be able to pause or come back later!")) {
        window.location.href = `test.html?test=${assignmentId}`;
    }
}

var answers = new Map();

export async function loadAssignment(_assignmentId) {
    const assignmentDetails = _assignmentId.split("~~");
    assignmentId = _assignmentId;
    eventName = assignmentDetails[0];
    assignmentName = assignmentDetails[1];
    assignmentSpecifier = assignmentDetails[2];

    const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
    mode = urlParams.get('mode') ?? "";

    getDoc(userDoc).then(async (doc) => {
        const data = await doc.data();

        if (!["admin", "preview"].includes(mode)) {
            if (!data.editableAssignments || !data.editableAssignments.includes(assignmentId)) {
                alert(`Sorry, you don't have permission to be in ${mode} mode!`);

                return window.location.href = "dashboard.html";
            } else {
                if (["admin", "preview"].includes(mode)) {
                    let attempts = 3;
                    while (attempts > 0) {
                        const key = prompt(`Please enter the admin key to enter ${mode} mode!`);
                        const keyEncoded = new TextEncoder().encode(key);

                        const keyHashed = await crypto.subtle.digest('SHA-512', keyEncoded);

                        if (keyHashed == "23fa162648b894edfcc95b7405ac44f79c1654fb052dcda4777ae0024cf55f9c465b6a560550e7dea47dcbcfeb3608eb74a3b9117508b4bef7fc962019ea04e0") {
                            return;
                        } else {
                            alert(`Key '${key}' incorrect! You have ${--attempts} remaining!`);
                        }
                    }

                    if (attempts <= 0) {
                        alert(`Too many incorrect attempts to access ${mode} mode! Please try again later.`);

                        return window.location.href = "dashboard.html";
                    }
                }
            }
        } else if (data["assignments"][assignmentId] == "Completed") {
            alert("Sorry, you already finished this assignment!");

            return window.location.href = "dashboard.html";
        } else if (!Object.keys(data["assignments"]).includes(assignmentId)) {
            alert("Sorry, you don't have this assignment!");

            return window.location.href = "dashboard.html";
        } else {
            data["assignments"][assignmentId] = "Completed";

            setDoc(userDoc, data, { merge: true }).then(() => {
                sfsciolylog(`Successfully locked user in!`, `Event=User locked into test&UID=${auth.currentUser.uid}&Event=${test}`);
            }).catch((e) => {
                sfsciolylog(`Error occurred locking user into test: ${e}`, `Event=Error occurred locking user into test&Error=${e}&UID=${auth.currentUser.uid}&Event=${test}`);

                alert("Error occurred accessing database, please refresh the page and try again!");
            });
        }
    });

    assignmentCollection = collection(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`);
    assignmentSubmissionDoc = doc(db, "users", auth.currentUser.uid, "assignments", assignmentId);

    _("title").innerHTML = assignmentName;
    _("details").innerHTML = `UID: ${auth.currentUser.uid} | Time Remaining: 50 minutes and 0 seconds`;

    var testContainer = _("test-container");

    let metadata;
    let questionOrder;

    getDocs(assignmentCollection).then((querySnapshot) => {
        const documents = new Map();

        querySnapshot.forEach((doc) => {
            documents.set(doc.id, doc);
        });

        metadata = documents.get("metadata").data();
        questionOrder = metadata.questionOrder;

        for (let questionIdN in questionOrder) {
            const questionId = questionOrder[questionIdN];
            questions.push(documents.get(questionId));
        }

        for (const questionIndex in questions) {
            if (questionIndex != 0) {
                testContainer.innerHTML += `<hr>`;
            }

            const doc = questions[questionIndex];
            const data = doc.data();

            const questionNumber = Number(questionIndex) + 1;

            switch (data.type) {
                case "mcq":
                    var question = `
                        <div class="question mcq">
                    `;

                    question += `
                            <div class="question-text">
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer mcq-options">
                    `;

                    for (let i in data.options) {
                        question += `
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="${doc.id}" id="question${questionIndex}-option${i}" value="${data.options[i]}" onchange="answer(this.id, this.value)">

                                    <label class="form-check-label" for="question${questionIndex}-option${i}">
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
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer msq-options">
                    `;

                    for (let i in data.options) {
                        question += `
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="question${questionIndex}option${i}" id="${doc.id}-moption${i}" value="${data.options[i]}" onchange="answer(this.id, this.value)">

                                    <label class="form-check-label" for="question${questionIndex}-moption${i}">
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
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer mq-options-container">
                    `;

                    question += `
                                <div class="mq-optionsA">
                    `;

                    for (let i in data.optionsA) {
                        question += `
                                    <div class="form-check">
                                        <input class="form-check-input mq-input" type="text" name="question${questionIndex}optionA${i}" id="${doc.id}-optionA${i}" maxlength="1" onchange="answer(this.id, this.value)">

                                        <label class="form-check-label" for="question${questionIndex}-optionA${i}">
                                            &nbsp;${data.optionsA[i]}
                                        </label>
                                    </div>
                        `;
                    }

                    question += `
                                </div>

                                <div class="mq-optionsB">
                    `;

                    for (let i in data.optionsB) {
                        question += `
                                    <div class="form-check">
                                        ${alphabet[Number(i)]}. ${data.optionsB[i]}
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
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer lrq-answer">
                    `;

                    question += `
                                <div class="form-group">
                                    <textarea class="form-control" id="question${questionIndex}-response" rows="5" onchange="answer(this.id, this.value)"></textarea>
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
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""})
                                &nbsp;
                                <label>${data.text.split("|~~~~|")[0]}</label>
                                <input type="text" class="fitb-answer" style="height: 30px" id="question${questionIndex}-blank" onchange="answer(this.id, this.value)">
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
        }
    }).then(async () => {
        if (["admin", "preview"].includes(mode)) {
            return;
        }

        await getDoc(assignmentSubmissionDoc).then((submissionDoc) => {
            if (submissionDoc.exists() && Object.keys(submissionDoc.data()).length > 1) {
                // @TODO - Display deadline

                const submissionResponses = submissionDoc.data();
                const submissionResponsesQ = Object.keys(submissionResponses);
                const submissionResponsesA = Object.values(submissionResponses);

                // @TODO - Refactor wtih question outputter forEach
                for (let r = 0; r < submissionResponsesQ.length; r++) {
                    if (!["time"].includes(submissionResponsesQ[r])) {
                        const questionId = submissionResponsesQ[r];
                        const q = questionOrder.indexOf(questionId);

                        const answer = submissionResponsesA[r];
                        answers.set(submissionResponsesQ[r], answer);

                        const qDoc = questions[q];

                        switch (qDoc.data().type) {
                            case "mcq":
                                const o = qDoc.data().options.indexOf(answer);
                                document.getElementById(`question${q}-option${o}`).checked = true;
                                break;
                            case "msq":
                                for (let o in answer) {
                                    const optionNumber = qDoc.data().options.indexOf(answer);
                                    document.getElementById(`question${q}-moption${o}`).checked = true;
                                }
                                break;
                            case "mq":
                                for (let o in answer) {
                                    document.getElementById(`question${q}-optionA${o}`).value = answer[o];
                                }
                                break;
                            case "lrq":
                                document.getElementById(`question${q}-response`).value = answer;
                                break;
                            case "fitb":
                                document.getElementById(`question${q}-blank`).value = answer;
                                break;
                        }
                    }
                }
            }

            // @TODO - Don't display time information if time is unlimited

            let startTime = (new Date()).getTime();

            setDoc(assignmentSubmissionDoc, {
                time: startTime
            }).catch((e) => {
                sfsciolylog(`Error occurred creating user answer sheet: ${e}`, `Event=Error occurred creating user answer sheet&Error=${e}&UID=${auth.currentUser.uid}&AssignmentID=${assignmentId}}`);
            });

            setTimeout(() => {
                timer();
            }, 1000);
        });
    }).catch((error) => {
        console.error(error);
        sfsciolylog(`Error occurred retrieving test: ${error}`, `Event=Error occurred retrieving test&Error=${error}&UID=${auth.currentUser.uid}&Event=${test}`);
    });
}

function timer() {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;

    var timeText = `${minutes} minute${(minutes == 1) ? "" : "s"} and ${seconds} second${(seconds == 1) ? "" : "s"}`;

    _("details").innerHTML = `UID: ${auth.currentUser.uid} | Time Remaining: ${timeText}`;

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

export function answer(id, answer) {
    if (id.includes("optionA")) {
        var answerList = new Array();

        if (answers.get(id.substr(0, id.indexOf("-"))) != undefined) {
            answerList = answers.get(id.substr(0, id.indexOf("-")));
        }

        console.log(id, answer);

        answerList[id.split("optionA")[1]] = answer;

        let a = 0;
        for (let unsafeAnswer of answerList) {
            if (typeof unsafeAnswer == "undefined") {
                answerList[a] = "";
            }

            a++;
        }

        answers.set(id.substr(0, id.indexOf("-")), answerList);
    } else if (id.includes("moption")) {
        var answerList = new Array();

        if (answers.get(id.substr(0, id.indexOf("-"))) != undefined) {
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

    console.log("answered", answers);

    saved = false;

    _("saveStatus").innerHTML = `Not Saved | <a onclick="manualSave()">Save</a>`;
}

export function saveAnswers(finished = false) {
    const data = {};

    answers.forEach((answer, question) => {
        data[question] = answer; // NOTE: Possible type error when saving/retrieving
    });

    setDoc(assignmentSubmissionDoc, data, { merge: true }).then(() => {
        sfsciolylog(`Saved ${assignmentId} answers`, `Event=Saved answers&UID=${auth.currentUser.uid}&AssignmentId=${assignmentId}`);

        if (finished) {
            alert(`Successfully submitted the test!`);

            assignmentId = "";
            eventName = "";
            assignmentName = "";

            window.location.href = "dashboard.html";
        } else {
            saved = true;
            saveTimestamp = (new Date()).getTime();

            _("saveStatus").innerHTML = `Saved at ${(new Date(saveTimestamp))}`;
        }
    }).catch((e) => {
        sfsciolylog(`Error occurred saving ${assignmentId} answers: ${e}`, `Event=Error occurred saving answers&Error=${e}&UID=${auth.currentUser.uid}&AssignmentID=${assignmentId}`);

        alert("Error occurred saving answers, please refresh the page and try again!");
    });
}

export function manualSave() {
    if ((new Date()).getTime() - saveTimestamp > 30000) {
        saveAnswers();
    } else {
        alert(`Sorry, please wait ${Math.ceil((30000 - ((new Date()).getTime() - saveTimestamp)) / 1000)} more seconds before manually saving again!`);
    }
}

export function submit(confirmed = false) {
    if (!confirmed) {
        if (!confirm("Are you sure you want to submit the test? You won't be able to access it again!")) {
            return;
        }
    }

    saveAnswers(true);

    sfsciolylog(`Submitted ${assignmentId} answers`, `Event=Submitted answers&UID=${auth.currentUser.uid}&AssignmentID=${assignmentId}`);
}

export function testRedirect(dest) {
    if (confirm("Are you sure you want to exit the test? If you do, your answers will be saved and submitted!")) {
        submit(true);

        if (dest == "dashboard") {
            window.location.href = "dashboard.html";
        } else { // @TODO - Branch off for public-facing index and private-facing pages
            if (auth.currentUser != null) {
                signOut();
            }

            if (!window.location.href.includes("index.html") || window.location.href != "") {
                window.location.href = "index.html";
            }
        }
    }
}
