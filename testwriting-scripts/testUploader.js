var admin = require("firebase-admin");
var serviceAccount = require("./sfhsscioly-firebase-adminsdk-vt7yy-dd86ff6389.json");

const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://sfhsscioly-default-rtdb.firebaseio.com"
});

const db = firebase.firestore();

async function main() {
    const eventName = "Tryouts 2023";
    const assignmentName = "WiFi Lab~~00434058972"
    const payload = [
        {
    ];

    const questionOrder = [];

    if (payload.length > 0) {
        for (let d = 0; d < payload.length; d++) {
            const questionId = new Date().valueOf().toString();
            const docRef = db.doc(`assignments/${eventName}/${assignmentName}/${questionId}`);

            await docRef.set(payload[d]).then(() => {
                console.log(`Added question #${d}!`);
            }).catch((e) => {
                console.error(e);
            });

            questionOrder.push(questionId);
        }

        const metadataDocRef = db.doc(`assignments/${eventName}/${assignmentName}/metadata`);

        metadataDocRef.set({
            questionOrder: questionOrder
        }).then(() => {
            console.log("Set metadata document!");
        }).catch((e) => {
            console.error(e);
        });
    }
}

main();
