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
    // return alert("Tryouts are over! Please contact an officer if you have any concerns!");

    const event = document.getElementById("event").value;

    if (event == "") {
        return alert("Please select an event!");
    } else if (event == "app") {
        return window.open("https://forms.gle/k5RXi1xDPYdrwEz26", "_blank");
    } else if (event == "code") {
        return window.open("https://sofoscioly.web.app/", "_blank");
    } else if (event == "fermi") {
        return window.open("https://sofoscioly.web.app/", "_blank");
    } else if (event == "builds") {
        return window.open("https://docs.google.com/document/d/1mo84btfpGLDAPJccACUtpevv9WXVACVuGVYEXvuF2bA/edit?usp=sharing", "_blank");
    }

    const name = document.getElementById("name").value;
    if (name == "" || name.split(" ").length < 2) {
        return alert("Please make sure you enter your full name (first and last)!");
    }

    const schoolId = document.getElementById("schoolId").value;
    if (!(new RegExp(`^[0-9]{6}$`).test(schoolId))) {
        return alert("Please make sure you enter your six-digit School ID! "
            + "This is the same as your lunch number and the number in your email!");
    }

    const contactEmail = document.getElementById("contactEmail").value;
    if (!(new RegExp(`.*@.*\..*`).test(contactEmail))) {
        return alert("Please make sure you've entered a valid email!");
    }

    if (contactEmail.includes("@forsyth")) {
        return alert("Sorry, you can't use your school email for the Contact Email! Please enter a personal email!");
    }

    setDoc(doc(db, "tryoutsSubmissions2023", contactEmail), {
        contactEmail: contactEmail,
    }, { merge: true }).then(() => {
        if (confirm("Are you ready to start this test? You are allowed to cancel!")) {
            get(child(ref(rtdb), `tryoutTestLink_${event}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    const link = snapshot.val();

                    const timeSeedCode = prompt(
                        "Enter the current 6-digit seed code. If you are taking this during the regular tryouts at the Dining Hall, it should be on the board. " +
                        "If you are taking this during an alternative block, ask an officer for the seed code."
                    );

                    const userInputtedTime = prompt("Enter the current time according to your device (ex. 4:30 PM). Don't lie—we can check!");
                    const systemTime = new Date().getTime();

                    const submissionId = `${event}_${systemTime}`;

                    const data = new Object();
                    data[submissionId] = new Object();
                    data[submissionId]["timeSeedCode"] = timeSeedCode;
                    data[submissionId]["userInputtedTime"] = userInputtedTime;
                    data[submissionId]["systemTime"] = systemTime;

                    setDoc(doc(db, "tryoutsSubmissions2023", contactEmail), data, { merge: true }).then(() => {
                        console.log("Began test!");

                        document.getElementById("eventSelection").style.display = "none";
                        document.getElementById("tryoutTest").style.display = "flex";
                        document.getElementById("tryoutTest").src = link;

                        document.getElementById("timer").style.display = "flex";

                        if (event == "chl") {
                            $(async () => {
                                await $("#referenceSheet").toggle();

                                await $("#referenceSheet").dialog();

                                const dialog = document.querySelector(".ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-draggable.ui-resizable");

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

                            document.getElementById("referenceSheetDoc").src = "https://firebasestorage.googleapis.com/v0/b/sfhsscioly.appspot.com/o/chemlabreferencesheet.pdf?alt=media&token=4ab3e014-ac10-466b-90fc-5f1b5d0e4509";

                            document.getElementById("referenceSheet").style.margin = "0%";
                            document.getElementById("referenceSheet").style.padding = "0%";

                            document.getElementById("referenceSheetDoc").style.width = "99%";
                            document.getElementById("referenceSheetDoc").style.height = "99%";
                        }

                        window.onkeydown = (e) => {
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
                                oobLog[new Date().getTime()] = e.keyCode;

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
                        data[submissionId]["timerStartTime"] = startTime;

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
                                    alert("Test over! Good job!\n\nIf you didn't click Submit on the form yet, press Enter or click Ok until you see the message confirming that your submission has been submitted.\n\nTo take another test, refresh the page.");

                                    window.location.href = "tryouts.html";
                                });
                            }
                        }, 1000);

                        const earlyExitAttempts = new Array();

                        window.addEventListener("beforeunload", (event) => {
                            event.preventDefault();

                            const newEarlyExitAttempt = new Date().getTime();
                            earlyExitAttempts.push(newEarlyExitAttempt);
                            data[submissionId][`earlyExitAttempt`] = earlyExitAttempts;

                            data[submissionId]["oobLog"] = oobLog;

                            setDoc(doc(db, "tryoutsSubmissions2023", contactEmail), data, { merge: true }).then(() => {
                                console.log("Saved earlyExitAttempt timestamp");
                            });

                            event.returnValue = "Leaving this page will submit your test. Are you sure you want to do this?";
                        });
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