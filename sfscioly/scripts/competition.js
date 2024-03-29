import {
    auth,
    db,
    _,
    sfsciolylog,
    securitycheck,
} from "./script.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

import {
    signOut
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js';

import { LaTeXJSComponent } from "https://cdn.jsdelivr.net/npm/latex.js/dist/latex.mjs";
customElements.define("latex-js", LaTeXJSComponent);

let assignmentId;
let eventName;
let assignmentName;
let assignmentSpecifier;
let assignmentCollection;
let assignmentSubmissionDoc;

const questions = new Array();
let metadata;
let questionOrder;

let oobState = -1;
let oobLog = new Object();

let time = 1800;

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const enAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const esAlphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const revAlphabet = "ZYXWVUTSRQPONMLKJIHGFEDCBA";
const baconian = {
    "A": "AAAAA",
    "B": "AAAAB",
    "C": "AAABA",
    "D": "AAABB",
    "E": "AABAA",
    "F": "AABAB",
    "G": "AABBA",
    "H": "AABBB",
    "I": "ABAAA",
    "J": "ABAAA",
    "K": "ABAAB",
    "L": "ABABA",
    "M": "ABABB",
    "N": "ABBAA",
    "O": "ABBAB",
    "P": "ABBBA",
    "Q": "ABBBB",
    "R": "BAAAA",
    "S": "BAAAB",
    "T": "BAABA",
    "U": "BAABB",
    "V": "BAABB",
    "W": "BABAA",
    "X": "BABAB",
    "Y": "BABBA",
    "Z": "BABBB",
};
const morse = {
    "A": ".-",
    "B": "-...",
    "C": "-.-.",
    "D": "-..",
    "E": ".",
    "F": "..-.",
    "G": "--.",
    "H": "....",
    "I": "..",
    "J": ".---",
    "K": "-.-",
    "L": ".-..",
    "M": "--",
    "N": "-.",
    "O": "---",
    "P": ".--.",
    "Q": "--.-",
    "R": ".-.",
    "S": "...",
    "T": "-",
    "U": "..-",
    "V": "...-",
    "W": ".--",
    "X": "-..-",
    "Y": "-.--",
    "Z": "--.."
};
const morbitAlphabet = {
    "..": 'OO',
    ".-": 'O-',
    ".X": 'OX',
    "-.": '-O',
    "--": '--',
    "-X": '-X',
    "X.": 'XO',
    "X-": 'X-',
    "XX": 'XX'
};
const toebesAlphabet = {
    "OO": "..",
    "O-": ".-",
    "OX": ".X",
    "-O": "-.",
    "--": "--",
    "-X": "-X",
    "XO": "X.",
    "X-": "X-",
    "XX": "XX"
};
const fracMorse = {
    "A": "•–",
    "B": "–•••",
    "C": "–•–•",
    "D": "–••",
    "E": "•",
    "F": "••–•",
    "G": "––•",
    "H": "••••",
    "I": "••",
    "J": "•–––",
    "K": "–•–",
    "L": "•–••",
    "M": "––",
    "N": "–•",
    "O": "–––",
    "P": "•––•",
    "Q": "––•–",
    "R": "•–•",
    "S": "•••",
    "T": "–",
    "U": "••–",
    "V": "•••–",
    "W": "•––",
    "X": "–••–",
    "Y": "–•––",
    "Z": "––••"
}

let mode = "";

export function oobLogger(triggerEvent) {
    if (oobState == 0 || ["admin", "preview", "submission", "unlimited"].includes(mode)) return;

    const trigger = (typeof triggerEvent == "string") ? triggerEvent : triggerEvent.type;

    console.log(oobState, trigger);

    const documentUnchanged = ["hide", "mouseleave", "blur", "peekattempt"].includes(trigger);

    if (
        document.visibilityState === "visible" && !documentUnchanged ||
        (["show", "mouseeenter", "resize", "focus", "peekattempt"].includes(trigger))
    ) {
        if (oobState == -1) {
            return oobState == 1;
        }

        if (oobState == 2 || ["resize", "peekattempt"].includes(trigger)) {
            oobLog[new Date().getTime()] = trigger;

            alert(
                "The portal has detected that you've left or attempted to leave the portal in some way. " +
                "Please do not move your mouse away from the page, open any other tabs, windows, or popups, " +
                "or leave the tab in any other way!" +
                "\n\n" +
                "If you're not sure why you're getting this message, raise your hand high and wait for an officer to come by!"
            );
        }
    } else {
        if (oobState == 3) return oobState = 1;

        console.log("oob detected!");

        oobLog[new Date().getTime()] = trigger;

        if (document.visibilityState != "visible" || (document.visibilityState == "visible" && !documentUnchanged)) {
            var playPromise = document.querySelector('#surpriseAudio').play();

            if (playPromise) {
                playPromise.then(function () {
                    console.log("played surprise!");
                }).catch(function (error) {
                    console.error(error);
                });
            }
        }

        oobState = 2;
    }
}

export function loadDashboard() {
    getDoc(userDoc).then((doc) => {
        if (!doc.exists()) {
            console.error("Error!");

            return alert("Error: userDoc does not exist!");
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
                    } else if (status == "Unlimited") {
                        document.getElementById("assignments").innerHTML += `
                            <div>
                                → <a onclick="window.location.href='test.html?test=${assignmentId}';">${eventName} - ${assignmentName}</a>
                            </div>
                        `;
                    } else if (status == "TOEBES") {
                        document.getElementById("assignments").innerHTML += `
                            <div>
                                → <a onclick="confirmOpenAssignment('${assignmentId}', 'toebes')">${eventName} - ${assignmentName}</a>
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

        if (doc.data()["competitions"]) {
            Object.keys(doc.data()["competitions"]).forEach((competition) => {
                const events = doc.data()["competitions"][competition].join(", ");

                document.getElementById("competitions").innerHTML += `
                    <div>
                        → <a href="competition.html?competition=${competition}">${competition} - ${events}</a>
                    </div>
                `;
            });
        }
    });
}

export function loadCompetition() {
    const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
    const competition = urlParams.get("competition");

    getDoc(doc(db, "competitions", competition)).then(async (doc) => {
        if (!doc.exists()) {
            return alert(`Sorry, but there doesn't seem to be a competition named "${competition}"!`)
        }

        const data = await doc.data();

        document.getElementById("competitionInformationName").innerHTML += data["name"];
        document.getElementById("competitionInformationFormat").innerHTML += data["format"];
        document.getElementById("competitionInformationDate").innerHTML += data["date"];

        document.getElementById("roster").src = data["roster"];

        if (data["selfScheduleOptions"]) {
            get(userDoc).then((_userDoc) => {
                document.getElementById("selfScheduleRow").style.display = "";

                for (let selfScheduleOption of data["selfScheduleOptions"]) {
                    document.getElementById("selfSchedule").innerHTML += "";
                }
            });
        }
    });
}

export function confirmOpenAssignment(assignmentId, source = "") {
    // @TODO - Check if test is time-limited
    if (confirm("Are you sure you want to begin this event? Once you start, the timer will start and you won't be able to pause or come back later!")) {
        if (source == "") {
            window.location.href = `test.html?test=${assignmentId}`;
        } else {
            window.location.href = `test.html?test=${assignmentId}&source=toebes`;
        }
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
    mode = urlParams.get("mode") ?? "";

    getDoc(userDoc).then(async (doc) => {
        const data = await doc.data();

        if (["admin", "preview", "submission"].includes(mode)) {
            if (!data.editableAssignments || !data.editableAssignments.includes(assignmentId)) {
                alert(`Sorry, you don't have permission to be in ${mode} mode!`);

                return window.location.href = "dashboard.html";
            } else {
                if (true || await securitycheck()) {
                    oobState = 0;

                    return console.log(`Successfully accessed ${mode} mode!`);
                } else {
                    return window.location.href = "dashboard.html";
                }
            }
        } else if (data["assignments"][assignmentId] == "Unlimited") {
            mode = "unlimited";
            oobState = 0;
        } else if (data["assignments"][assignmentId] == "Completed") {
            alert("Sorry, you already finished this assignment!");

            return window.location.href = "dashboard.html";
        } else if (!Object.keys(data["assignments"]).includes(assignmentId)) {
            alert("Sorry, you don't have this assignment!");

            return window.location.href = "dashboard.html";
        } else {
            data["assignments"][assignmentId] = "Completed";

            if (window.location.href.includes("test")) {
                const alertSuper = alert;
                alert = (message = "") => {
                    oobState = 0;

                    alertSuper(message);

                    oobState = 3;
                }

                const confirmSuper = confirm;
                confirm = (message = "") => {
                    oobState = 0;

                    const result = confirmSuper(message);

                    oobState = 1;

                    return result;
                }

                window.addEventListener('beforeunload', (event) => {
                    if (eventName != "None") {
                        event.preventDefault();

                        event.returnValue = "";
                    }
                });

                // @TODO - Move this to after we confirm that OOB is being tracked
                //         so that we don't have issues with non-proctored assignments
                //         and exits before the assignment has loaded
                document.addEventListener("visibilitychange", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("show", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("hide", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("mouseenter", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("mouseleave", (triggerEvent) => { oobLogger(triggerEvent) });
                window.addEventListener("resize", (triggerEvent) => { oobLogger(triggerEvent) });
                window.addEventListener("focus", (triggerEvent) => { oobLogger(triggerEvent) });
                window.addEventListener("blur", (triggerEvent) => { oobLogger(triggerEvent) });

                document.onkeydown = function (e) {
                    if (
                        e.keyCode == 123 ||
                        e.ctrlKey &&
                        (
                            (e.shiftKey && e.keyCode == 73) ||
                            (e.shiftKey && e.keyCode == 67) ||
                            (e.shiftKey && e.keyCode == 74) ||
                            (e.keyCode == 85)
                        )
                    ) {
                        oobLogger("peekattempt");

                        return false;
                    }
                }
            }

            setDoc(userDoc, data, { merge: true }).then(() => {
                oobState = 1;

                sfsciolylog(`Successfully locked user in!`, `Event=User locked into test&UID=${auth.currentUser.uid}&Event=${test}`);
            }).catch((e) => {
                sfsciolylog(`Error occurred locking user into test: ${e}`, `Event=Error occurred locking user into test&Error=${e}&UID=${auth.currentUser.uid}&Event=${test}`);

                alert("Error occurred accessing database, please refresh the page and try again!");
            });
        }
    });

    assignmentCollection = collection(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`);

    _("title").innerHTML = assignmentName;

    if (mode == "submission") {
        document.getElementById("details").innerHTML = `UID: ${urlParams.get("uid")}`;
        document.getElementById("saveStatus").outerHTML = ``;
        document.getElementById("submit").outerHTML = ``;

        // @TODO - Modify
        //          document.getElementById("test-container").style.height
        //         dynamically to fit entire test for submission printing

        assignmentSubmissionDoc = doc(db, "users", urlParams.get("uid"), "assignments", assignmentId);
    } else if (mode = "unlimited") {
        _("details").innerHTML = `UID: ${auth.currentUser.uid} | Time: Unlimited`;
        document.getElementById("submit").outerHTML = ``;

        assignmentSubmissionDoc = doc(db, "users", auth.currentUser.uid, "assignments", assignmentId);
    } else {
        _("details").innerHTML = `UID: ${auth.currentUser.uid} | Time Remaining: 30 minutes and 0 seconds`;

        assignmentSubmissionDoc = doc(db, "users", auth.currentUser.uid, "assignments", assignmentId);
    }

    var testContainer = _("test-container");

    getDocs(assignmentCollection).then(async (querySnapshot) => {
        const documents = new Map();

        await querySnapshot.forEach((doc) => {
            documents.set(doc.id, doc);
        });

        metadata = await documents.get("metadata").data();

        if (metadata.referenceSheet && mode != "submission") {
            $(async () => {
                await $("#referenceSheet").toggle();

                await $("#referenceSheet").dialog();

                const dialog = document.querySelector(".ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-draggable.ui-resizable");

                $("#referenceSheet").mouseover((() => {
                    oobState = 0;
                }));

                $("#referenceSheet").mouseout((() => {
                    oobState = 1;
                }));

                document.querySelector(".ui-dialog-titlebar-close").outerHTML = `<a type="a" class="ui-dialog-toggle">Hide</a>`;

                await $(".ui-dialog-toggle").click(() => {
                    $("#referenceSheetDoc").toggle();

                    if (document.getElementById("referenceSheetDoc").style.display == "none") {
                        dialog.style.height = "0%";

                        document.querySelector(".ui-dialog-toggle").innerHTML = `Show`;
                    } else {
                        dialog.style.height = "";

                        document.querySelector(".ui-dialog-toggle").innerHTML = `Hide`;
                    }
                });
            });

            document.getElementById("referenceSheetDoc").src = metadata.referenceSheet;

            document.getElementById("referenceSheet").style.margin = "0%";
            document.getElementById("referenceSheet").style.padding = "0%";

            document.getElementById("referenceSheetDoc").style.width = "99%";
            document.getElementById("referenceSheetDoc").style.height = "99%";
        }

        questionOrder = await metadata.questionOrder;

        for (let questionIdN in questionOrder) {
            const questionId = await questionOrder[questionIdN];
            questions.push(documents.get(questionId));
        }

        let questionNumber = 0;

        for (const questionIndex in questions) {
            if (questionIndex != 0) {
                testContainer.innerHTML += `<hr>`;
            }

            const doc = await questions[questionIndex];
            const data = await doc.data();

            questionNumber += await data.type == "text" ? 0 : 1;

            switch (data.type) {
                case "text":
                    var question = `
                        <div class="question text" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
                            <div class="question-text">
                                ${data.text}
                            </div>
                        </div>
                    `;

                    testContainer.innerHTML += question;
                    break;
                case "mcq":
                    var question = `
                        <div class="question mcq" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
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
                                    <input class="form-check-input" type="radio" name="${doc.id}" id="${doc.id}-option${i}" value="${data.options[i]}" onchange="answer(this.id, this.value)">

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
                        <div class="question msq" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
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
                        <div class="question mq" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
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
                        <div class="question lrq" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
                            <div class="question-text">
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                            </div>
                            <div class="answer lrq-answer">
                                <div class="form-group">
                                    <textarea class="form-control" id="${doc.id}-response" rows="5" onchange="answer(this.id, this.value)"></textarea>
                                </div>
                            </div>
                    `;

                    if (data.cipher == "fractionatedmorse") {
                        const topRow = `
                            <td style="padding: 0vh 0.5vw;">Replacement</td>
                        ` + `
                            <td>
                                <input class="code-answer" type="text" maxlength="1" autocapitalize="word">
                            </td>
                        `.repeat(26);

                        const bottomRow = `
                            <td style="padding: 0vh 0.5vw;">Morse</td>
                            <td>•<br>•<br>•</td>
                            <td>•<br>•<br>–</td>
                            <td>•<br>•<br>×</td>
                            <td>•<br>–<br>•</td>
                            <td>•<br>–<br>–</td>
                            <td>•<br>–<br>×</td>
                            <td>•<br>×<br>•</td>
                            <td>•<br>×<br>–</td>
                            <td>•<br>×<br>×</td>
                            <td>–<br>•<br>•</td>
                            <td>–<br>•<br>–</td>
                            <td>–<br>•<br>×</td>
                            <td>–<br>–<br>•</td>
                            <td>–<br>–<br>–</td>
                            <td>–<br>–<br>×</td>
                            <td>–<br>×<br>•</td>
                            <td>–<br>×<br>–</td>
                            <td>–<br>×<br>×</td>
                            <td>×<br>•<br>•</td>
                            <td>×<br>•<br>–</td>
                            <td>×<br>•<br>×</td>
                            <td>×<br>–<br>•</td>
                            <td>×<br>–<br>–</td>
                            <td>×<br>–<br>×</td>
                            <td>×<br>×<br>•</td>
                            <td>×<br>×<br>–</td>
                        `;

                        question += `
                            <br>
                            <div style="display: flex; justify-content: center;">
                                <table cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr>
                                        ${topRow}
                                        </tr>
                                        <tr>
                                        ${bottomRow}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }

                    question += `
                        </div>
                    `;

                    testContainer.innerHTML += question;
                    break;
                case "fitb":
                    var question = `
                        <div class="question fitb"oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
                    `;

                    question += `
                            <div>
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""})
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
                case "code":
                    var question = `
                        <div class="question code" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
                    `;

                    question += `
                            <div class="question-text">
                                ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                            </div>
                    `;

                    question += `
                            <div class="answer code-answer">
                    `;

                    const quote = await data.quote;
                    const quoteArray = data.cipher == "patristocrat"
                        ? quote.replace(/[^a-zA-Z]/g, "").match(/.{1,5}/g)
                        : quote.split(new RegExp(" ", "g"));

                    for (let i in quoteArray) {
                        const quoteWord = await quoteArray[i];

                        let topRow = ``;
                        let bottomRow = ``;

                        for (let j in quoteWord) {
                            let qt = await quoteWord[j];

                            if (await qt.match(/[a-zA-Z]/i)) {
                                topRow += `
                                    <td id="topRow${i}${j}">${qt}</td>
                                `;

                                bottomRow += `
                                    <td>
                                        <input id="${doc.id}-input${i}.${j}" class="code-answer" type="text" name="${doc.id}-input${i}.${j}"
                                            maxlength="1" autocapitalize="word" onchange="answer(this.id, this.value)">
                                    </td>
                                `;
                            } else {
                                topRow += `
                                    <td id="topRow${i}${j}">${qt}</td>
                                `;

                                bottomRow += `
                                    <td>

                                    </td>
                                `;
                            }
                        }

                        question += `
                            <table cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                        ${topRow}
                                    </tr>
                                    <tr>
                                        ${bottomRow}
                                    </tr>
                                </tbody>
                            </table>
                        `;
                    }

                    question += `
                        </div>
                    `;

                    if (["aristocrat", "patristocrat", "xenocrypt"].includes(data.cipher)) {
                        let topRow = `<td style="padding: 0vh 0.5vw;">Letter</td>`;
                        let middleRow = `<td style="padding: 0vh 0.5vw;">Substitution</td>`;
                        let bottomRow = `<td style="padding: 0vh 0.5vw;">Frequency</td>`;

                        const alphabet = `ABCDEFGHIJKLMN${data.cipher == "xenocrypt" ? "Ñ" : ""}OPQRSTUVWXYZ`;

                        for (let l in alphabet) {
                            const letter = alphabet[l];
                            const freq = (quote.match(new RegExp(letter, "gi")) ?? "").length;

                            topRow += `<td>${letter}</td>`

                            middleRow += `
                                <td>
                                    <input class="code-answer" type="text" maxlength="1" autocapitalize="word">
                                </td>
                            `

                            bottomRow += `<td>${freq}</td>`;
                        }

                        question += `
                            <div style="display: flex; justify-content: center;">
                                <table cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr>
                                        ${topRow}
                                        </tr>
                                        <tr>
                                        ${middleRow}
                                        </tr>
                                        <tr>
                                        ${bottomRow}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }

                    question += `
                        </div>
                    `;

                    testContainer.innerHTML += question;
                    break;
                default:
                    alert("An error occurred preparing the test! Please contact an officer for assistance!");
            }

            console.log(questionIndex);
        }

        for (let questionTextElement of document.querySelectorAll("div.question-text")) {
            questionTextElement.oncopy = () => { return false };
            questionTextElement.oncut = () => { return false };
        }
    }).then(async () => {
        if (["admin", "preview"].includes(mode)) {
            return;
        }

        await getDoc(assignmentSubmissionDoc).then((submissionDoc) => {
            let startTime = 0;
            const currentTime = new Date().getTime();

            if (submissionDoc.exists() && Object.keys(submissionDoc.data()).length > 1) {
                // @TODO - Display deadline

                const submissionResponses = submissionDoc.data();
                const submissionResponsesQ = Object.keys(submissionResponses);
                const submissionResponsesA = Object.values(submissionResponses);

                // @TODO - Refactor wtih question outputter forEach if possible
                for (let r = 0; r < submissionResponsesQ.length; r++) {
                    if (submissionResponsesQ[r] == "oob") {
                        oobLog = submissionResponsesA[r];
                    } else if (submissionResponsesQ[r] == "time") {
                        startTime = submissionResponsesA[r];
                        console.log(currentTime, startTime, currentTime - startTime);
                        time = Math.ceil((1800000 - (currentTime - startTime)) / 1000);
                    } else if (!["time", "oob"].includes(submissionResponsesQ[r])) {
                        const questionId = submissionResponsesQ[r];
                        const q = questionOrder.indexOf(questionId);

                        const answer = submissionResponsesA[r];
                        answers.set(submissionResponsesQ[r], answer);

                        const qDoc = questions[q];

                        // @TODO - MCQ/MSQ/MQ - Account for change in option order
                        //       - Possible solution: using option ID's
                        //       - Issue: How can we handle newly-added or deleted options?
                        switch (qDoc.data().type) {
                            case "mcq":
                                const o = qDoc.data().options.indexOf(answer);
                                document.getElementById(`${questionId}-option${o}`).checked = true;
                                break;
                            case "msq":
                                for (let o in answer) {
                                    const optionNumber = qDoc.data().options.indexOf(answer[o]);
                                    document.getElementById(`${questionId}-moption${optionNumber}`).checked = true;
                                }
                                break;
                            case "mq":
                                for (let o in answer) {
                                    document.getElementById(`${questionId}-optionA${o}`).value = answer[o];
                                }
                                break;
                            case "lrq":
                                document.getElementById(`${questionId}-response`).value = answer;
                                break;
                            case "fitb":
                                document.getElementById(`${questionId}-blank`).value = answer;
                                break;
                            case "code":
                                for (let position of Object.keys(answer)) {
                                    document.getElementById(`${questionId}-input${position}`).value = answer[position];
                                };
                                break;
                        }
                    }
                }
            }


            if (mode == "submission") return;

            if (mode == "unlimited") {
                setInterval(() => {
                    saveAnswers();
                }, 30 * 1000);

                return;
            }

            if (startTime == 0) {
                startTime = new Date().getTime();

                setDoc(assignmentSubmissionDoc, {
                    time: startTime
                }, { merge: true }).catch((e) => {
                    sfsciolylog(`Error occurred creating user answer sheet: ${e}`, `Event=Error occurred creating user answer sheet&Error=${e}&UID=${auth.currentUser.uid}&AssignmentID=${assignmentId}}`);
                });
            }

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
    if (time < 0) {
        time = 1800;
    }

    var minutes = Math.floor(time / 60);
    var seconds = time % 60;

    var timeText = `${minutes} minute${(minutes == 1) ? "" : "s"} and ${seconds} second${(seconds == 1) ? "" : "s"}`;

    _("details").innerHTML = `UID: ${auth.currentUser.uid} | Time Remaining: ${timeText}`;

    if (time % 90 == 0) {
        saveAnswers();
    }

    time -= 1;

    if (time <= 0) {
        console.log("ran out of time");
        submit(true);
    } else {
        return setTimeout(timer, 1000);
    }
}

var saved = false;
var saveTimestamp = 0;

export function answer(id, answer) {
    const questionId = id.split("-")[0];

    console.log(id, answer);

    if (id.includes("moption")) {
        var answerList = new Array();

        if (answers.get(questionId) != undefined) {
            answerList = answers.get(questionId);
        }

        if (_(id).checked) {
            answerList.push(answer);
        } else {
            answerList.splice(answerList.indexOf(answer), 1);
        }

        answers.set(questionId, answerList);
    } else if (id.includes("optionA")) {
        var answerList = new Array();

        if (answers.get(questionId) != undefined) {
            answerList = answers.get(questionId);
        }

        answerList[id.split("optionA")[1]] = answer;

        let a = 0;
        for (let unsafeAnswer of answerList) {
            if (typeof unsafeAnswer == "undefined") {
                answerList[a] = "";
            }

            a++;
        }

        answers.set(questionId, answerList);
    } else if (id.includes("input")) {
        var answerSet = {};

        if (answers.get(questionId) != undefined) {
            answerSet = answers.get(questionId);
        }

        answerSet[id.split("input")[1]] = answer;

        // @TODO - Deleted entries must be deleted from Firestore separately
        for (let unsafePosition of Object.keys(answerSet)) {
            let unsafeAnswer = answerSet[unsafePosition];
            if (typeof unsafeAnswer == "undefined" || unsafeAnswer == "") {
                delete answerSet[unsafePosition];
            }
        };

        answers.set(questionId.toString(), answerSet);
    } else {
        answers.set(questionId, answer);
    }

    console.log("answered", answers, answers[questionId]);

    saved = false;

    _("saveStatus").innerHTML = `Not Saved | <a onclick="manualSave()">Save</a>`;
}

export function saveAnswers(finished = false) {
    const data = {};

    answers.forEach((answer, question) => {
        // @TODO - Possible type error when saving/retrieving, need to test
        console.log(question, answer);
        data[question] = answer;
    });

    data["oob"] = oobLog;

    setDoc(assignmentSubmissionDoc, data, { merge: true }).then(() => {
        sfsciolylog(`Saved ${assignmentId} answers`, `Event=Saved answers&UID=${auth.currentUser.uid}&AssignmentId=${assignmentId}`);

        console.log(answers);

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

        console.error(e);

        alert("Error occurred saving answers, please contact an officer!");
    });
}

export function manualSave() {
    if ((new Date()).getTime() - saveTimestamp > 60000) {
        saveAnswers();
    } else {
        alert(`Sorry, please wait ${Math.ceil((60000 - ((new Date()).getTime() - saveTimestamp)) / 1000)} more seconds before manually saving again!`);
    }
}

export function submit(preconfirmed = false) {
    if (!preconfirmed && ["admin", "preview", "submission"].includes(mode)) {
        if (confirm("Are you sure you want to submit the test? You won't be able to access it again!")) {
            return;
        }

        oobState = 0;
    }

    saveAnswers(true);

    sfsciolylog(`Submitted ${assignmentId} answers`, `Event=Submitted answers&UID=${auth.currentUser.uid}&AssignmentID=${assignmentId}`);
}

export function testRedirect(dest) {
    oobState = 0;

    if (["admin", "preview", "submission", "unlimited"].includes(mode)) {
        window.location.href = "index.html";
    } else if (confirm("Are you sure you want to exit the test? If you do, your answers will be saved and submitted!")) {
        submit(true);

        window.onbeforeunload = () => { };

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
    } else {
        oobState = 1;
    }
}

export function importToebesTest(assignmentId) {
    const assignmentDetails = assignmentId.split("~~");

    const sourceInfo = doc(db, "assignments", assignmentDetails[0], assignmentDetails[1] + "~~" + assignmentDetails[2], "sourceInfo");

    getDoc(sourceInfo).then(async (doc) => {
        const file = doc.data()["file"];

        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const toebesPayload = JSON.parse(xhttp.responseText);

                processToebesPayload(assignmentId, toebesPayload);
            }
        };

        xhttp.open("GET", `https://firebasestorage.googleapis.com/v0/b/sfhsscioly.appspot.com/o/${file.replace("/", "%2F")}?alt=media&token=4c67289c-e963-4a50-b81d-071268691c65`, true);

        xhttp.send();
    });
}

export async function processToebesPayload(_assignmentId, toebesPayload) {
    let payload = new Array();

    for (const key in toebesPayload) {
        if (key == "TEST.0") {
            continue;
        }

        const value = toebesPayload[key];

        let qText = value.question.replace(/<p>/g, "");
        let qCipher = value.cipherType;
        let qQuote = "";
        let qType = "code";
        const qValue = value.points;
        const qImage = "";
        const qTiebreaker = false;

        switch (value.cipherType) {
            case "aristocrat":
                qCipher = (qText.includes("xenocrypt")) ? "xenocrypt" : "aristocrat";

                if (qText.includes("xenocrypt")) {
                    qQuote = value.cipherString
                        .toUpperCase()
                        .normalize("NFKD")
                        .replace(/[\u0300-\u0302]|[\u0304-\u036f]/g, "")
                        .replace(/N\u0303/g, "Ñ")
                        .split("")
                        .map(letter => new RegExp(/[A-Z\u00d1]/g).test(letter)
                            ? value.replacement[letter]
                            : letter
                        )
                        .join("");
                } else {
                    for (let pt of value.cipherString.toUpperCase()) {
                        const i = enAlphabet.indexOf(pt);
                        qQuote += (i == -1) ? pt : value.alphabetDest[i];
                    }
                }
                break;
            case "patristocrat":
                qQuote = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .split("")
                    .map(letter => value.replacement[letter])
                    .join("")
                    .match(/.{1,5}/g)
                    .join(" ");
                break;
            case "hill":
                if (value.question.includes("Compute the decryption matrix") || value.cipherString == "") {
                    qType = "lrq";
                } else {
                    qCipher += `-${value.operation}`;

                    if (value.operation == "encode") {
                        qQuote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");
                    } else {
                        const keyword = value.keyword.toUpperCase();
                        const quote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");

                        let keyMatrix = [parseInt(keyword[0], 36) - 10, parseInt(keyword[1], 36) - 10, parseInt(keyword[2], 36) - 10, parseInt(keyword[3], 36) - 10];

                        for (let i = 0; i < quote.length; i += 2) {
                            const qt0 = enAlphabet[
                                ((parseInt(value.cipherString[i], 36) - 10) * keyMatrix[0] + (parseInt(quote[i + 1], 36) - 10) * keyMatrix[1]) % 26
                            ];
                            const qt1 = enAlphabet[
                                ((parseInt(value.cipherString[i], 36) - 10) * keyMatrix[2] + (parseInt(quote[i + 1], 36) - 10) * keyMatrix[3]) % 26
                            ];

                            qQuote += qt0;
                            qQuote += qt1;
                        }
                    }
                }
                break;
            case "pollux":
                const splitTextPollux = qText.split(".");
                if (splitTextPollux[1].includes("=") || !Object.keys(value).includes("crib")) {
                    qText = `${splitTextPollux[0]}. `;

                    qText += `${value.dotchars[0]}=., ${value.dotchars[1]}=., `;
                    qText += `${value.dashchars[0]}=-, `;
                    qText += `${value.xchars[0]}=X, and ${value.xchars[1]}=X</p>`;
                }

                qText += `${value.encoded.split("").join(" ")}`;

                qType = "lrq";
                break;
            case "morbit":
                const splitTextMorbit = qText.split(". ");
                if (splitTextMorbit[1].includes("matches to") || splitTextMorbit[1].includes("O")) {
                    qText = splitTextMorbit[0] + ". ";

                    let p = 0;
                    Object.entries(value.replacement).forEach(([morse, num]) => {
                        if (value.hint.includes(num)) {
                            p++;

                            qText += `${p <= 1 ? " " : ", "}${p == 5 ? "and " : ""}${num}=${toebesAlphabet[morse]}`;
                        }
                    });

                    qText += `</p>`;
                }

                let morseTextMorbit = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z ]/g, "")
                    .split("")
                    .map(letter => {
                        return letter == " " ? "X" : `${morse[letter]}X`;
                    })
                    .join("");

                if (morseTextMorbit.length % 2 != 0) {
                    morseTextMorbit += "X";
                }

                for (let i = 0; i < morseTextMorbit.length; i += 2) {
                    qText += value.replacement[morbitAlphabet[morseTextMorbit.substring(i, i + 2)]];
                    qText += " ";
                }

                qType = "lrq";
                break;
            case "fractionatedmorse":
                // Backwards compatability with old, buggy Codebuilder Fractionated Morse generator
                if (!qText.includes("</p>")) {
                    qText += "</p>";
                }

                let morseTextFracMorse = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z ]/g, "")
                    .split("")
                    .map(letter => {
                        return letter == " " ? "×" : `${fracMorse[letter]}×`;
                    })
                    .join("");

                if (morseTextFracMorse.endsWith("×")) {
                    morseTextFracMorse = morseTextFracMorse.slice(0, -1);
                } else if (morseTextFracMorse.endsWith("××")) {
                    morseTextFracMorse = morseTextFracMorse.slice(0, -2);
                }

                if (morseTextFracMorse.length % 3 == 1) {
                    morseTextFracMorse += "××";
                } else if (morseTextFracMorse.length % 3 == 2) {
                    morseTextFracMorse += "×";
                }

                let replacement = value.replacement;

                // Backwards compatability with old, buggy Codebuilder Fractionated Morse generator
                if (Object.keys(replacement).includes("...")) {
                    for (let morseFraction of [
                        "...", "..-", "..X", ".-.", ".--", ".-X", ".X.", ".X-", ".XX", "-..",
                        "-.-", "-.X", "--.", "---", "--X", "-X.", "-X-", "-XX", "X..", "X.-",
                        "X.X", "X-.", "X--", "X-X", "XX.", "XX-"
                    ]) {
                        replacement[
                            morseFraction.replace(/\./g, "•").replace(/-/g, "–").replace(/X/g, "×")
                        ] = replacement[morseFraction];

                        delete replacement[morseFraction];
                    }
                }

                for (let i = 0; i < morseTextFracMorse.length; i += 3) {
                    qText += replacement[morseTextFracMorse.substring(i, i + 3)];
                    qText += " ";
                }

                qType = "lrq";
                break;
            case "porta":
                if (value.operation == "encode") {
                    qQuote = value.cipherString
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")
                        .match(new RegExp(`.{1,${value.blocksize}}`, "g"))
                        .join(" ");
                } else {
                    const keyword = value.keyword.toUpperCase();
                    const quote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");

                    let keyNumbers = new Array();
                    for (let i = 0; i < keyword.length; i++) {
                        keyNumbers.push(Math.floor(enAlphabet.indexOf(keyword[i % keyword.length]) / 2));
                    }

                    const k = keyNumbers.length;

                    for (let i = 0; i < quote.length; i++) {
                        if (i > 0 && i % k == 0) {
                            qQuote += " ";
                        }

                        let pt = enAlphabet.indexOf(quote[i]);

                        qQuote += enAlphabet[
                            pt < 13 ?
                                ((pt + keyNumbers[i % k]) % 13 + 13) :
                                ((pt - keyNumbers[i % k]) % 13)
                        ];
                    }
                }
                break;
            case "railfence":
                let quote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");

                const railsArray = new Array(value.rails).fill("");

                let rowDirection = 1;
                let row = 0;

                for (let i = 0; i < quote.length; i++) {
                    railsArray[row] += quote[i];

                    row += rowDirection;

                    if ((i != 0 && row == 0) || row == value.rails - 1) {
                        rowDirection *= -1;
                    }
                }

                qText += railsArray.join("");

                qType = "lrq";
                break;
            case "atbash":
                for (let pt of value.cipherString.toUpperCase()) {
                    const i = enAlphabet.indexOf(pt);
                    qQuote += (i == -1) ? pt : revAlphabet[i];
                }
                break;
            case "caesar":
                for (let pt of value.cipherString.toUpperCase()) {
                    const i = enAlphabet.indexOf(pt);
                    qQuote += (i == -1) ? pt : enAlphabet[(i + value.offset) % 26];
                }
                break;
            case "vigenere":
                if (value.operation == "encode") {
                    qQuote = value.cipherString
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")
                        .match(new RegExp(`.{1,${value.blocksize}}`, "g"))
                        .join(" ");
                } else {
                    const keynums = value.keyword.toUpperCase().split("").map(keyLetter => enAlphabet.indexOf(keyLetter));

                    const plaintext = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");

                    for (let l in plaintext) {
                        if (l % value.blocksize == 0 && l != 0) {
                            qQuote += " ";
                        }

                        const pt = plaintext[l];

                        const i = enAlphabet.indexOf(pt);
                        qQuote += (i == -1) ? "" : enAlphabet[(i + keynums[l % value.blocksize]) % 26];
                    }
                }
                break;
            case "affine":
                if (value.operation == "encode") {
                    qQuote = value.cipherString.toUpperCase();
                } else {
                    for (let pt of value.cipherString.toUpperCase()) {
                        const i = enAlphabet.indexOf(pt);
                        qQuote += (i == -1) ? pt : enAlphabet[(value.a * enAlphabet.indexOf(pt) + value.b) % 26];
                    }
                }
                break;
            case "baconian":
                const encoded = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .split("")
                    .map(letter => {
                        const abMapping = baconian[letter];
                        return abMapping.split("").map(ab => {
                            return ab == "A"
                                ? value.texta[Math.floor(Math.random() * value.texta.length)]
                                : value.textb[Math.floor(Math.random() * value.textb.length)];
                        }).join("");
                    })
                    .join("");

                qText += `${encoded}`;

                qType = "lrq";
                break;
        }

        payload.push({
            "text": qText,
            "cipher": qCipher,
            "quote": qQuote,
            "type": qType,
            "value": qValue,
            "image": qImage,
            "tiebreaker": qTiebreaker,
        });
    };

    const assignmentDetails = _assignmentId.split("~~");
    assignmentId = _assignmentId;
    eventName = assignmentDetails[0];
    assignmentName = assignmentDetails[1];
    assignmentSpecifier = assignmentDetails[2];

    getDoc(userDoc).then(async (doc) => {
        const data = await doc.data();

        if (data["assignments"][assignmentId] == "Completed") {
            alert("Sorry, you already finished this assignment!");

            return window.location.href = "dashboard.html";
        } else if (!Object.keys(data["assignments"]).includes(assignmentId)) {
            alert("Sorry, you don't have this assignment!");

            return window.location.href = "dashboard.html";
        } else {
            data["assignments"][assignmentId] = "Completed";

            if (window.location.href.includes("test")) {
                const alertSuper = alert;
                alert = (message = "") => {
                    oobState = 0;

                    alertSuper(message);

                    oobState = 3;
                }

                const confirmSuper = confirm;
                confirm = (message = "") => {
                    oobState = 0;

                    const result = confirmSuper(message);

                    oobState = 1;

                    return result;
                }

                window.addEventListener('beforeunload', (event) => {
                    if (eventName != "None") {
                        event.preventDefault();

                        event.returnValue = "";
                    }
                });

                // @TODO - Move this to after we confirm that OOB is being tracked
                //         so that we don't have issues with non-proctored assignments
                //         and exits before the assignment has loaded
                document.addEventListener("visibilitychange", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("show", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("hide", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("mouseenter", (triggerEvent) => { oobLogger(triggerEvent) });
                document.addEventListener("mouseleave", (triggerEvent) => { oobLogger(triggerEvent) });
                window.addEventListener("resize", (triggerEvent) => { oobLogger(triggerEvent) });
                window.addEventListener("focus", (triggerEvent) => { oobLogger(triggerEvent) });
                window.addEventListener("blur", (triggerEvent) => { oobLogger(triggerEvent) });

                document.onkeydown = function (e) {
                    if (
                        e.keyCode == 123 ||
                        e.ctrlKey &&
                        (
                            (e.shiftKey && e.keyCode == 73) ||
                            (e.shiftKey && e.keyCode == 67) ||
                            (e.shiftKey && e.keyCode == 74) ||
                            (e.keyCode == 85)
                        )
                    ) {
                        oobLogger("peekattempt");

                        return false;
                    }
                }
            }

            setDoc(userDoc, data, { merge: true }).then(() => {
                oobState = 1;

                sfsciolylog(`Successfully locked user in!`, `Event=User locked into test&UID=${auth.currentUser.uid}&Event=${test}`);
            }).catch((e) => {
                sfsciolylog(`Error occurred locking user into test: ${e}`, `Event=Error occurred locking user into test&Error=${e}&UID=${auth.currentUser.uid}&Event=${test}`);

                alert("Error occurred accessing database, please refresh the page and try again!");
            });
        }
    });

    _("title").innerHTML = assignmentName;
    _("details").innerHTML = `UID: ${auth.currentUser.uid} | Time Remaining: 25 minutes and 0 seconds`;

    assignmentSubmissionDoc = doc(db, "users", auth.currentUser.uid, "assignments", assignmentId);

    $(async () => {
        await $("#referenceSheet").toggle();

        await $("#referenceSheet").dialog();

        const dialog = document.querySelector(".ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-draggable.ui-resizable");

        $("#referenceSheet").mouseover((() => {
            oobState = 0;
        }));

        $("#referenceSheet").mouseout((() => {
            oobState = 1;
        }));

        document.querySelector(".ui-dialog-titlebar-close").outerHTML = `<a type="a" class="ui-dialog-toggle">Hide</a>`;

        await $(".ui-dialog-toggle").click(() => {
            $("#referenceSheetDoc").toggle();

            if (document.getElementById("referenceSheetDoc").style.display == "none") {
                dialog.style.height = "0%";

                document.querySelector(".ui-dialog-toggle").innerHTML = `Show`;
            } else {
                dialog.style.height = "";

                document.querySelector(".ui-dialog-toggle").innerHTML = `Hide`;
            }
        });
    });

    document.getElementById("referenceSheetDoc").src = "https://scilympiad.com/Data/shared/testRefs/CodebustersRef2023.pdf";

    document.getElementById("referenceSheet").style.margin = "0%";
    document.getElementById("referenceSheet").style.padding = "0%";

    document.getElementById("referenceSheetDoc").style.width = "99%";
    document.getElementById("referenceSheetDoc").style.height = "99%";

    var testContainer = _("test-container");

    let questionNumber = 0;

    for (const questionIndex in payload) {
        if (questionIndex != 0) {
            testContainer.innerHTML += `<hr>`;
        }

        const data = await payload[questionIndex];

        questionNumber += await data.type == "text" ? 0 : 1;

        switch (data.type) {
            case "text":
                var question = `
                    <div class="question text" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
                        <div class="question-text">
                            ${data.text}
                        </div>
                    </div>
                `;

                testContainer.innerHTML += question;
                break;
            case "lrq":
                var question = `
                    <div class="question lrq" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
                        <div class="question-text">
                            ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                        </div>
                        <div class="answer lrq-answer">
                            <div class="form-group">
                                <textarea class="form-control" id="${questionNumber}-response" rows="5" onchange="answer(this.id, this.value)"></textarea>
                            </div>
                        </div>
                `;

                if (data.cipher == "fractionatedmorse") {
                    const topRow = `
                        <td style="padding: 0vh 0.5vw;">Replacement</td>
                    ` + `
                        <td>
                            <input class="code-answer" type="text" maxlength="1" autocapitalize="word">
                        </td>
                    `.repeat(26);

                    const bottomRow = `
                        <td style="padding: 0vh 0.5vw;">Morse</td>
                        <td>•<br>•<br>•</td>
                        <td>•<br>•<br>–</td>
                        <td>•<br>•<br>×</td>
                        <td>•<br>–<br>•</td>
                        <td>•<br>–<br>–</td>
                        <td>•<br>–<br>×</td>
                        <td>•<br>×<br>•</td>
                        <td>•<br>×<br>–</td>
                        <td>•<br>×<br>×</td>
                        <td>–<br>•<br>•</td>
                        <td>–<br>•<br>–</td>
                        <td>–<br>•<br>×</td>
                        <td>–<br>–<br>•</td>
                        <td>–<br>–<br>–</td>
                        <td>–<br>–<br>×</td>
                        <td>–<br>×<br>•</td>
                        <td>–<br>×<br>–</td>
                        <td>–<br>×<br>×</td>
                        <td>×<br>•<br>•</td>
                        <td>×<br>•<br>–</td>
                        <td>×<br>•<br>×</td>
                        <td>×<br>–<br>•</td>
                        <td>×<br>–<br>–</td>
                        <td>×<br>–<br>×</td>
                        <td>×<br>×<br>•</td>
                        <td>×<br>×<br>–</td>
                    `;

                    question += `
                        <br>
                        <div style="display: flex; justify-content: center;">
                            <table cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                    ${topRow}
                                    </tr>
                                    <tr>
                                    ${bottomRow}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                question += `
                    </div>
                `;

                testContainer.innerHTML += question;
                break;
            case "code":
                var question = `
                    <div class="question code" oncopy="return false" oncut="return false" onpaste="return false" onselect="return false">
                `;

                question += `
                        <div class="question-text">
                            ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                        </div>
                `;

                question += `
                        <div class="answer code-answer">
                `;

                const quote = await data.quote;
                const quoteArray = data.cipher == "patristocrat"
                    ? quote.replace(/[^a-zA-Z]/g, "").match(/.{1,5}/g)
                    : quote.split(new RegExp(" ", "g"));

                for (let i in quoteArray) {
                    const quoteWord = await quoteArray[i];

                    let topRow = ``;
                    let bottomRow = ``;

                    for (let j in quoteWord) {
                        let qt = await quoteWord[j];

                        if (await qt.match(/[a-zA-Z]/i)) {
                            topRow += `
                                <td id="topRow${i}${j}">${qt}</td>
                            `;

                            bottomRow += `
                                <td>
                                    <input id="${questionNumber}-input${i}.${j}" class="code-answer" type="text" name="${questionNumber}-input${i}.${j}"
                                        maxlength="1" autocapitalize="word" onchange="answer(this.id, this.value)">
                                </td>
                            `;
                        } else {
                            topRow += `
                                <td id="topRow${i}${j}">${qt}</td>
                            `;

                            bottomRow += `
                                <td>

                                </td>
                            `;
                        }
                    }

                    question += `
                        <table cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    ${topRow}
                                </tr>
                                <tr>
                                    ${bottomRow}
                                </tr>
                            </tbody>
                        </table>
                    `;
                }

                question += `
                    </div>
                `;

                if (["aristocrat", "patristocrat", "xenocrypt"].includes(data.cipher)) {
                    let topRow = `<td style="padding: 0vh 0.5vw;">Letter</td>`;
                    let middleRow = `<td style="padding: 0vh 0.5vw;">Substitution</td>`;
                    let bottomRow = `<td style="padding: 0vh 0.5vw;">Frequency</td>`;

                    const alphabet = `ABCDEFGHIJKLMN${data.cipher == "xenocrypt" ? "Ñ" : ""}OPQRSTUVWXYZ`;

                    for (let l in alphabet) {
                        const letter = alphabet[l];
                        const freq = (quote.match(new RegExp(letter, "gi")) ?? "").length;

                        topRow += `<td>${letter}</td>`

                        middleRow += `
                            <td>
                                <input class="code-answer" type="text" maxlength="1" autocapitalize="word">
                            </td>
                        `

                        bottomRow += `<td>${freq}</td>`;
                    }

                    question += `
                        <div style="display: flex; justify-content: center;">
                            <table cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                    ${topRow}
                                    </tr>
                                    <tr>
                                    ${middleRow}
                                    </tr>
                                    <tr>
                                    ${bottomRow}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                question += `
                    </div>
                `;

                testContainer.innerHTML += question;
                break;
            default:
                alert("An error occurred preparing the test! Please contact an officer for assistance!");
        }

        console.log(questionIndex);

        for (let questionTextElement of document.querySelectorAll("div.question-text")) {
            questionTextElement.oncopy = () => { return false };
            questionTextElement.oncut = () => { return false };
        }
    }

    await getDoc(assignmentSubmissionDoc).then((submissionDoc) => {
        let startTime = 0;
        const currentTime = new Date().getTime();

        if (submissionDoc.exists() && Object.keys(submissionDoc.data()).length > 1) {
            // @TODO - Display deadline

            const submissionResponses = submissionDoc.data();
            const submissionResponsesQ = Object.keys(submissionResponses);
            const submissionResponsesA = Object.values(submissionResponses);

            // @TODO - Refactor wtih question outputter forEach if possible
            for (let r = 0; r < submissionResponsesQ.length; r++) {
                if (submissionResponsesQ[r] == "oob") {
                    oobLog = submissionResponsesA[r];
                } else if (submissionResponsesQ[r] == "time") {
                    startTime = submissionResponsesA[r];
                    console.log(currentTime, startTime, currentTime - startTime);
                    time = Math.ceil((1800000 - (currentTime - startTime)) / 1000);
                } else if (!["time", "oob"].includes(submissionResponsesQ[r])) {
                    const questionId = submissionResponsesQ[r];
                    const q = Number(questionId) - 1;

                    const answer = submissionResponsesA[r];
                    answers.set(submissionResponsesQ[r], answer);

                    const question = payload[q];

                    // @TODO - MCQ/MSQ/MQ - Account for change in option order
                    //       - Possible solution: using option ID's
                    //       - Issue: How can we handle newly-added or deleted options?
                    switch (question.type) {
                        case "lrq":
                            document.getElementById(`${questionId}-response`).value = answer;
                            break;
                        case "code":
                            for (let position of Object.keys(answer)) {
                                document.getElementById(`${questionId}-input${position}`).value = answer[position];
                            };
                            break;
                    }
                }
            }
        }

        if (startTime == 0) {
            startTime = new Date().getTime();

            setDoc(assignmentSubmissionDoc, {
                time: startTime
            }, { merge: true }).catch((e) => {
                sfsciolylog(`Error occurred creating user answer sheet: ${e}`, `Event=Error occurred creating user answer sheet&Error=${e}&UID=${auth.currentUser.uid}&AssignmentID=${assignmentId}}`);
            });
        }

        setTimeout(() => {
            timer();
        }, 1000);
    });
}
