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

import { Sortable as Sortable } from '../modules/sortable.core.esm.js';

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

const questions = new Array();

export function loadAssignmentsToManage(filter = new Array()) {
    getDoc(doc(db, "users", auth.currentUser.uid)).then((doc) => {
        const editableAssignments = doc.data()["editableAssignments"];

        if (editableAssignments && editableAssignments.length > 0 && editableAssignments[0].includes("~~")) {
            editableAssignments.forEach((editableAssignment) => {
                document.getElementById("editAssignments").innerHTML += `
                    <div class="assignment">
                        <div>
                            <a>${editableAssignment.split("~~")[0]} - ${editableAssignment.split("~~")[1]}</a>
                        </div>

                        <div id="editAssignmentControls${editableAssignment}"
                            class="editAssignmentControls"
                            onclick="manageAssignment('${editableAssignment}')">
                            <a class="material-icons" onclick="manageAssignment('${editableAssignment}')">drive_file_rename_outline</a>
                            <a class="material-icons" onclick="previewAssignment('${editableAssignment}')">visibility</a>
                            <a class="material-icons" onclick="deleteAssignment('${editableAssignment}')">delete</a>
                        </div>
                    </div>
                `;
            });
        } else {
            document.getElementById("editAssignments").innerHTML += `
                <a>You do not have any editable assignments! You may create one using one of the options above.</a>
            `;
        }
    });
}

export async function loadAssignmentToManage(_assignmentId) {
    const assignmentDetails = _assignmentId.split("~~");
    assignmentId = _assignmentId;
    eventName = assignmentDetails[0];
    assignmentName = assignmentDetails[1];
    assignmentSpecifier = assignmentDetails[2];

    assignmentCollection = collection(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`);
    const metadataDoc = doc(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`, "metadata");

    const questionsContainer = document.getElementById("questionsContainer");

    getDocs(assignmentCollection).then(async (querySnapshot) => {
        const documents = new Map();

        querySnapshot.forEach((doc) => {
            documents.set(doc.id, doc);
        });

        const metadata = documents.get("metadata").data();
        const questionOrder = metadata.questionOrder;

        console.log(documents.keys());
        console.log(questionOrder);

        for (let questionIdN in questionOrder) {
            const questionId = questionOrder[questionIdN];
            questions.push(documents.get(questionId));
        }

        for (const questionIndexStr in questions) {
            const questionIndex = Number(questionIndexStr);

            const doc = questions[questionIndex];
            const data = doc.data();

            questionsContainer.innerHTML += `
                <div class="question-list-item list-group-item" style="border: 1px solid black;">
                    <span class="material-icons question-reorder">reorder</span>
                    <button id="editQuestion${questionIndex}Button"
                            onclick="openQuestionEditorWindow(${questionIndex})">
                        Edit Question #${questionIndex + 1}
                    </button>
                </div>
            `;
        }

        const sortableQuestions = Sortable.create(questionsContainer, {
            handle: ".question-reorder",
            animation: 150,
            onEnd: (event) => {
                if (event.oldIndex != event.newIndex) {
                    const updatedQuestionNumber = questionOrder.splice(event.oldIndex, 1);
                    questionOrder.splice(event.newIndex, 0, updatedQuestionNumber[0]);

                    const updatedQuestion = questions.splice(event.oldIndex, 1);
                    questions.splice(event.newIndex, 0, updatedQuestion[0]);

                    setDoc(metadataDoc, {
                        questionOrder: questionOrder
                    }, { merge: true });

                    document.getElementById(`editQuestion${event.oldIndex}Button`).onclick =
                                            `openQuestionEditorWindow(${event.newIndex})`;

                    document.getElementById(`editQuestion${event.newIndex}Button`).onclick =
                                            `openQuestionEditorWindow(${event.oldIndex})`;

                    document.getElementById(`editQuestion${event.oldIndex}Button`).id =
                                            `MOVING_editQuestion${event.newIndex}`;

                    document.getElementById(`editQuestion${event.newIndex}Button`).id =
                                            `editQuestion${event.oldIndex}`;

                    document.getElementById(`MOVING_editQuestion${event.newIndex}Button`).id =
                                            `editQuestion${event.newIndex}`;
                }
            }
        });
    });
}

export function addQuestion() {

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

    console.log(question);

    // @TODO - Load question data if existing question
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
        case "mqA":
            const nA = document.getElementById(`mqOptionsA`).childElementCount;

            const newOptionA = `
                <div>
                    <input class="form-control mq-input" type="text" name="mq-optionA${nA}" id="mq-optionA${nA}">
                </div>
            `;

            break;
        case "mqA":
            const nB = document.getElementById(`mqOptionsB`).childElementCount;

            if (nB > 52) {
                return alert("You cannot have more than 52 answer options for Matching Questions!");
            }

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
    switch (questionData.type) {
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
            break;
        case "lrq":
            break;
        case "fitb":
            if (!questionData.text.includes("|~~~|")) {
                return alert("Please make sure to include one or more blanks using '|~~~|' for Fill-in-the-Blank Questions!");
            }

            break;
    }

    setDoc(doc(db, "assignments", question.event, "Math~~12345"), data, { merge: true }).then(() => {
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

// @TODO - Test locking and timing functionality needs to be overriden when mode=preview
//         and preview permissions need to be verified
//       - Possibilities: 1. Check userDoc editableAssignments (database costs)
//                        2. Check hash in URL using library such as argon2
export function previewAssignment(assignmentId) {
    window.location.href = `test.html?test=${assignmentId}&mode=preview`;
}

export function manageAssignment(assignmentId) {
    window.location.href = `assignmenteditor.html?assignmentId=${assignmentId}`;
}

// @TODO - Allow for restore functionality within a given time period
export function deleteAssignment() {
    if (!confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {

    }
}
