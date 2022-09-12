import {
    db,
    _,
    sfsciolylog
} from "./script.js";

import {
    doc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

import {
    getDatabase,
    ref,
    child,
    get
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-database.js';

let oobLog = new Object();

const rtdb = getDatabase();

export function retrieveEvent() {
    const name = document.getElementById("name").value;
    const schoolId = document.getElementById("schoolId").value;
    const contactEmail = document.getElementById("contactEmail").value;
    const event = document.getElementById("event").value;

    if (name == "" || name.split(" ").length < 2) {
        return alert("Please make sure you enter your full name (first and last)!");
    }

    if (!(new RegExp(`^[0-9]{6}$`).test(schoolId))) {
        return alert("Please make sure you enter your six-digit School ID! "
            + "This is the same as your lunch number and the number in your email!");
    }

    if (!(new RegExp(`.*@.*\..*`).test(contactEmail))) {
        return alert("Please make sure you've entered a valid email!");
    }

    if (contactEmail.includes("@forsyth")) {
        return alert("Sorry, you can't use your school email for the Contact Email! Please enter a personal email!");
    }

    if (event == "") {
        return alert("Please select an event!");
    }

    setDoc(doc(db, "tryoutsSubmissions2023", contactEmail), {
        contactEmail: contactEmail,
    }, { merge: true }).then(() => {
        if (confirm("Are you ready to start this test? You are allowed to cancel!")) {
            get(child(ref(rtdb), `tryoutTestLink_${event}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    const link = snapshot.val();

                    const userInputtedTime = prompt("Enter the current time according to your device (ex. 4:30 PM). Don't lie—we can check!");
                    const systemTime = new Date().getTime();

                    const submissionId = `${event}_${systemTime}`;

                    const data = new Object();
                    data[submissionId] = new Object();
                    data[submissionId]["userInputtedTime"] = userInputtedTime;
                    data[submissionId]["systemTime"] = systemTime;

                    setDoc(doc(db, "tryoutsSubmissions2023", contactEmail), data, { merge: true }).then(() => {
                        console.log("Began test!");

                        document.getElementById("eventSelection").style.display = "none";
                        document.getElementById("tryoutTest").style.display = "flex";
                        document.getElementById("tryoutTest").src = link;

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
                                oobLog[new Date().getTime()] = trigger;

                                alert(
                                    "The portal has detected that you've attempted to view the page source in some way! " +
                                    "Do not do this as it can appear as though you are cheating!" +
                                    "\n\n" +
                                    "If you have a serious concern, or if you're not sure why you're getting this message, " +
                                    "raise your hand high and wait for an officer to come by!"
                                );

                                return false;
                            }
                        }

                        const startTime = new Date().getTime();

                        setInterval(() => {
                            const updateTime = new Date().getTime()
                            const timeLeft = 1830000 - (updateTime - startTime);

                            if (timeLeft > 0) {
                                const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);
                                const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

                                document.getElementById("timer").innerHTML = `${minutesLeft}m ${secondsLeft}s left!`;
                            } else {
                                data[submissionId]["completionTime"] = updateTime;
                                data[submissionId]["oobLog"] = oobLog;

                                setDoc(doc(db, "tryoutsSubmissions2023", contactEmail), data, { merge: true }).then(() => {
                                    alert("Test over! Good job!");

                                    window.location.href = "tryouts.html";
                                });
                            }
                        }, 1000);
                    }).catch((error) => {
                        console.error("Error writing document: ", error);

                        alert("Something strange happened! Raise your hand high and wait for an officer to come by!")
                    });
                } else {
                    alert("Couldn't find the link for that tryout test!");
                }
            }).catch((error) => {
                console.error(error);
            });
        }
    }).catch((e) => {
        alert("Could not save information! Raise your hand high and wait for an officer to come by!\n\nError:", e);

        console.error(e);
    });
}