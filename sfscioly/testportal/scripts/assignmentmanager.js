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
    setDoc,
    deleteDoc
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
let metadataDoc;

const questions = new Array();
let questionOrder;

let questionNumbersContainer;
let questionsContainer;

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
    metadataDoc = doc(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`, "metadata");

    questionsContainer = document.getElementById("questionsContainer");
    questionNumbersContainer = document.getElementById("questionNumbersContainer");

    getDocs(assignmentCollection).then(async (querySnapshot) => {
        const documents = new Map();

        querySnapshot.forEach((doc) => {
            documents.set(doc.id, doc);
        });

        const metadata = documents.get("metadata").data();
        questionOrder = metadata.questionOrder;

        for (let questionIdN in questionOrder) {
            const questionId = questionOrder[questionIdN];
            questions.push(documents.get(questionId));
        }

        for (const questionIndexStr in questions) {
            const questionIndex = Number(questionIndexStr);

            questions[questionIndex].index = questionIndex;

            loadQuestionUI(questionIndex);
        }

        const sortableQuestions = Sortable.create(questionsContainer, {
            handle: ".question-reorder",
            animation: 200,
            onEnd: (event) => {
                if (event.oldIndex != event.newIndex) {
                    const oldIndex = event.oldIndex;
                    const newIndex = event.newIndex;

                    const updatedQuestionNumber = questionOrder.splice(oldIndex, 1)[0];
                    questionOrder.splice(newIndex, 0, updatedQuestionNumber);

                    const updatedQuestion = questions.splice(oldIndex, 1);
                    questions.splice(newIndex, 0, updatedQuestion[0]);

                    setDoc(metadataDoc, {
                        questionOrder: questionOrder
                    }, { merge: true });
                }
            }
        });
    });
}

export function addQuestion() {
    const questionId = (new Date()).valueOf().toString();

    setDoc(doc(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`, questionId), questionJson["lrq"], { merge: true }).then(() => {
        getDoc(doc(db, "assignments", eventName, `${assignmentName}~~${assignmentSpecifier}`, questionId)).then((doc) => {
            questions.push(doc);
            questionOrder.push(questionId);

            loadQuestionUI(questionOrder.length - 1);

            console.log(questionOrder);

            setDoc(metadataDoc, { questionOrder: questionOrder }, { merge: true });

            openQuestionEditorWindow(questionId);
        });
    });
}

export function deleteQuestion(questionId) {
    const questionIndex = questionOrder.indexOf(questionId);

    questionOrder.splice(questionIndex, 1);
    setDoc(metadataDoc, { questionOrder: questionOrder }, { merge: true });

    deleteDoc(questions[questionIndex].ref);
    questions.splice(questionIndex, 1);
}

function loadQuestionUI(questionIndex) {
    const questionId = questionOrder[questionIndex];

    questionNumbersContainer.innerHTML += `
        <div class="question-number list-group-item" style="border: 1px solid black;">
                ${Number(questionIndex) + 1}.
        </div>
    `;

    const questionPreview = questions[questionIndex].data().text
        .substring(0, 90).replace(/ /g, "&nbsp;");

    questionsContainer.innerHTML += `
        <div class="question-list-item list-group-item" style="border: 1px solid black;">
            <span class="material-icons question-reorder">reorder</span>

            <div class="question-preview">
                ${questionPreview}
            </div>

            <div class="question-controls-container">
                <a class="material-icons question-control"
                    onclick="openQuestionEditorWindow('${questionId}')">
                    drive_file_rename_outline
                </a>

                <a class="material-icons question-control"
                    onclick="deleteQuestion('${questionId}')">
                    delete
                </a>
            </div>
        </div>
    `;
}

export function openQuestionEditorWindow(questionId) {
    const questionEditorWindowSettings =
        `height=${window.innerHeight * 0.6},` +
        `width=${window.innerWidth * 0.6},` +
        `left=${window.innerWidth * 0.3},` +
        `top=${window.innerWidth * 0.3},` +
        `resizable = yes, scrollbars = yes, toolbar = yes, menubar = no, location = no, directories = no, status = yes`
    ;

    const popupWindow = window.open("./questioneditor.html", 'popUpWindow', questionEditorWindowSettings);

    popupWindow.window.question = questions[questionOrder.indexOf(questionId)];
}

export function loadQuestionEditor() {
    document.getElementById("questionTitle").innerHTML += `${Number(question.index) + 1}`;

    window.questionData = new Map();

    questionData = question.data();

    document.getElementById("questionText").value = questionData.text;
    document.getElementById("questionValue").value = questionData.value;

    switch (questionData.type) {
        case "mcq":
            document.getElementById("questionType").selectedIndex = 1;

            for (let i in questionData.options) {
                if (i > 4) {
                    document.getElementById("mcqOptions").innerHTML += `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="mcq" id="mcq-option${i}">

                            <label class="form-check-label" for="mcq-option${i}">
                                <input type="text">
                            </label>
                        </div>
                    `;
                }

                document.getElementById(`mcq-option${i}`).value = questionData.options[i];
            }

            break;
        case "msq":
            document.getElementById("questionType").selectedIndex = 2;

            for (let i in questionData.options) {
                if (i > 4) {
                    document.getElementById("msqOptions").innerHTML += `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="msq" id="msq-moption${i}">

                            <label class="form-check-label" for="msq-moption${i}">
                                <input type="text">
                            </label>
                        </div>
                    `;
                }

                document.getElementById(`msq-moption${i}`).value = questionData.options[i];
            }

            break;
        case "mq":
            document.getElementById("questionType").selectedIndex = 3;

            for (let i in questionData.optionsA) {
                if (i > 4) {
                    document.getElementById("mqOptionsA").innerHTML += `
                        <div>
                            <input class="form-control mq-input" type="text" name="mq-optionA${i}" id="mq-optionA${i}">
                        </div>
                    `;
                }

                document.getElementById(`mq-optionA${i}`).value = questionData.optionsA[i];
            }

            for (let i in questionData.optionsB) {
                if (i > 4) {
                    document.getElementById("mqOptionsB").innerHTML += `
                        <div class="form-control">
                            <input id="mq-optionB${i}" type="text">
                        </div>
                    `;
                }

                document.getElementById(`mq-optionB${i}`).value = questionData.optionsB[i];
            }

            break;
        case "lrq":
            document.getElementById("questionType").selectedIndex = 0;

            break;
        case "fitb":
            document.getElementById("questionType").selectedIndex = 4;

            break;
    }
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

    setDoc(doc(db, ...question.ref.path.split("/")), questionData, { merge: true }).then(() => {

    }).catch((e) => {
        console.log(e);
    });
}

export function createAssignment(preset = "blank") {
    switch (preset) {
        case "blank":
            setDoc(doc(db, ), {}, { merge: true });
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
