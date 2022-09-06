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
            "type": "mcq",
            "text": "A quantized “packet” of electromagnetic radiation is called a(n)",
            "options": [
                "Proton",
                "Electron",
                "Alpha particle",
                "Photon",
            ],
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Electromagnetic waves are __________.",
            "options": [
                "Mechanical",
                "Transverse",
                "Latitudinal",
                "Longitudinal"
            ],
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Which of the following is the correct label for the offset between the two waves labeled by the orange X?",
            "options": [
                "Amplitude",
                "Period",
                "Phase",
                "Wavelength"
            ],
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Which of the following is the correct label for the distance between points G and H labeled by the green Y?",
            "options": [
                "Amplitude",
                "Period",
                "Phase",
                "Wavelength"
            ],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "The amplitude is the distance between which two points? There are multiple correct answers, only write two!",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "fitb",
            "text": "As the energy in an electromagnetic wave travelling at the speed of light increases, its wavelength |~~~| and its frequency |~~~~|.",
            "value": 4,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "fitb",
            "text": "The question above shows that wavelength is |~~~~|-proportional to energy and frequency is |~~~~|-proportional to energy.",
            "value": 4,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "In a vacuum, does a gamma ray travel faster than, slower than. or at the same speed as a radio wave?",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "In a vacuum, does an x-ray have more energy than, less energy than, or the same energy as a radio wave?",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "In a vacuum, does visible light go a longer distance than, shorter distance than, or the same distance per period as a radio wave?",
            "value": 4,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "msq",
            "text": "Which of the following waves could be a radio wave? Select all that apply.",
            "options": [
                "A wave that has more energy than a microwave",
                "A wave that has a wavelength of 15 cm",
                "A wave that completes 5 million cycles in 30 seconds",
                "A wave that can be seen with the naked human eye",
                "A wave that was radiated by a 2.4 GHz WiFi router"
            ],
            "value": 6,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "A certain discrete signal has a frequency of 15 kHz.\n\nHow much time passes in between each signal? What is this quantity referred to as?",
            "value": 4,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "A certain discrete signal has a frequency of 15 kHz.\n\nWhat portion of the electromagnetic spectrum does this signal fall in?",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "What is the wavelength of a WiFi signal with a frequency of 2.4 GHz?",
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "What is the wavelength of a WiFi signal with a frequency of 4 GHz?",
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "If the refractive index of a material is 2, what does this tell you about the speed of light in the material?",
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "If a photon travelling at half the speed of light has a frequency of 108 MHz, what is its wavelength?",
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "The behavior of electromagnetic waves is dictated by ‘s equations.",
            "options": [
                "Newton",
                "Maxwell",
                "Schrodinger",
                "Ohm"
            ],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "",
            "options": [
                "",
                "",
                "",
                "",
            ],
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "",
            "options": [
                "",
                "",
                "",
                "",
            ],
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "",
            "options": [
                "",
                "",
                "",
                "",
            ],
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "",
            "value": ,
            "image": "",
            "tiebreaker": false
        },
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
