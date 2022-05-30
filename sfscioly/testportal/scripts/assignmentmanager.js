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

const questionJson = {
    "mcq": {
        "type": "mcq",
        "text": "",
        "options": [],
        "value": 0,
        "image": "",
        "tiebreaker": false
    },
    "msq": {
        "type": "msq",
        "text": "",
        "options": [],
        "value": 0,
        "image": "",
        "tiebreaker": false
    },
    "mq": {
        "type": "mq",
        "text": "",
        "optionsA": [],
        "optionsB": [],
        "value": 0,
        "image": "",
        "tiebreaker": false
    },
    "lrq": {
        "type": "lrq",
        "text": "",
        "value": 0,
        "image": "",
        "tiebreaker": false
    },
    "fitb": {
        "type": "fitb",
        "text": "|~~~~|",
        "value": 0,
        "image": "",
        "tiebreaker": false
    }
}

let assignmentId;
let eventName;
let assignmentName;
let assignmentSpecifier;
let assignmentCollection;

const questions = new Map();

window.addEventListener("onload", () => {
    if (window.location.href.includes("testportal/assignmentmanager")) {
        loadAssignmentsToManage();
    } else if (window.location.href.includes("testportal/assignmenteditor")) {
        const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
        assignmentId = urlParams.get('assignmentId');

        loadAssignmentToManage(assignmentId);
    }
});

export function loadAssignmentsToManage(filter = new Array()) {

}

export async function loadAssignmentToManage(_assignmentId) {
    const assignmentDetails = _assignmentId.split("~~");
    assignmentId = _assignmentId;
    eventName = assignmentDetails[0];
    assignmentName = assignmentDetails[1];
    assignmentSpecifier = assignmentDetails[2];

    assignmentCollection = collection(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`);

    const questionsContainer = document.getElementById("questionsContainer");

    getDocs(assignmentCollection).then((querySnapshot) => {
        let q = 0;

        querySnapshot.forEach((doc) => {
            questions[Number(doc.id.split("question")[1])] = doc;

            if (q != 0) {
                questionsContainer.innerHTML += `<hr>`;
            }

            const data = doc.data();

            questionsContainer.innerHTML += `
                <button onclick="openQuestionEditorWindow(${q})">Edit Question #${q + 1}</button>
            `;

            q++;
        });
    });
}

export function openQuestionEditorWindow(n) {
    const questionEditorWindowSettings =
        `height=${window.innerHeight * 0.75},` +
        `width=${window.innerWidth * 0.75},` +
        `left=${window.innerWidth * 0.25},` +
        `top=${window.innerWidth * 0.25},` +
        `resizable = yes, scrollbars = yes, toolbar = yes, menubar = no, location = no, directories = no, status = yes`
    ;

    const popupWindow = window.open("./questioneditor.html", 'popUpWindow', questionEditorWindowSettings);

    popupWindow.window.question = questions[n];
}

export function loadQuestionEditor() {
    document.getElementById("questionTitle").innerHTML += `${Number(question.id.split("question")[1]) + 1}`;

    window.questionData = new Map();
}

export function setQuestionType() {
    const questionType = document.getElementById("questionType").value;

    questionData.type = questionType;

    for (let type of ["mcq", "msq", "mq", "lrq", "fitb"]) {
        Array.from(document.getElementsByClassName(`${type}`)).forEach(element => {
           element.style.display = type == questionType ? "flex" : "none"; 
        });
    }

    switch (questionType) {
        case "mcq":
            break;
        case "msq":
            break;
        case "mq":
            break;
        case "lrq":
            break;
        case "fitb":
            break;
    }
}

export function addOption() {
    const type = questionData.type;

    switch (type) {
        case "mcq": case "msq":
            const n = document.getElementById(`${type}Options`).childElementCount - 2;

            const newOption = `
                <div class="form-check">
                    <input class="form-check-input" type="${type == "mcq" ? "radio" : "checkbox"}"
                        name="${type}${type == "mcq" ? "" : ("-" + type)}"
                        id="${type}-option${n}">

                    <label class="form-check-label" for="mcq-option${n}">
                        <input type="text" onchange="setMcqOption(${n})">
                        <a class="material-icons" onclick="removeOption(${n})">delete</a>
                    </label>
                </div>
            `;

            document.getElementById(`${questionData.type}Options`).innerHTML += newOption;

            break;
        case "mq":
            const nA = document.getElementById(`mqOptionsA`).childElementCount;

            const newOptionA = `
                <div>
                    <input class="form-control mq-input" type="text" name="mq-optionA${nA}" id="mq-optionA${nA}">
                </div>
            `;

            const nB = document.getElementById(`mqOptionsB`).childElementCount;

            const newOptionB = `
                <div class="form-control">
                    <input id="mq-optionB${nB}" type="text">
                </div>
            `;

            document.getElementById("mqOptionsA").innerHTML += newOptionA;
            document.getElementById("mqOptionsB").innerHTML += newOptionB;

            break;
    }
}

export function removeOption(n) {
    document.getElementById(`${questionData.type}Options`).removeChild(document.getElementById(`question${n}`));
}

export function saveQuestion() {
    switch (questionType) {
        case "mcq":
            if (questionData.options.length < 2) {
                return alert("Please enter at least two possible options for Multiple Choice Questions!");
            }

            if (questionData.options.length > 52) {
                return alert("Please make sure there are no more than 52 answer options for Multiple Choice Questions!");
            }

            break;
        case "msq":
            if (questionData.options.length < 2) {
                return alert("Please enter at least two possible options for Multiple Select Questions!");
            }

            if (questionData.options.length > 52) {
                return alert("Please make sure there are no more than 52 answer options for Multiple Select Questions!");
            }

            break;
        case "mq":
            if (questionData.optionsA.length < 2 || questionData.optionsB.length < 2) {
                return alert("Please enter at least two possible answer options for Matching Questions!");
            }

            if (questionData.optionsB.length > 52) {
                return alert("Please make sure there are no more than 52 answer options for Matching Questions!");
            }

            break;
        case "lrq":
            break;
        case "fitb":
            if (!questionData.text.includes("|~~~|")) {
                return alert("Please make sure to include one or more blanks using '|~~~|' for Fill-in-the-Blank Questions!");
            }

            break;
    }

    setDoc(doc(db, "assignments", "Astronomy", "Math~~12345"), data, { merge: true }).then(() => {
        console.log(`Successfully added card ${name} of type ${type}!`);

        return alert(`Successfully added card ${name} of type ${type}!`);
    }).catch((e) => {
        console.log(e);

        return alert("Error occurred! Please contact a developer!");
    });
}

export function createAssignment(preset = "blank") {
    switch (preset) {
        case "blank":

            break;
        default:
            alert(`Assignment creation preset "${preset}" implemented yet!`);
    }
}

export function previewAssignment(assignmentId) {
    window.location.href = `test.html?test=${assignmentId}&mode=preview`;
}

export function manageAssignment(assignmentId) {
    window.location.href = `assignmenteditor.html?assignmentId=${assignmentId}`;
}

export function deleteAssignment() {

}
