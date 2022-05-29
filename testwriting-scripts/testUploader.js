var admin = require("firebase-admin");
var serviceAccount = require("./sfhsscioly-firebase-adminsdk-vt7yy-dd86ff6389.json");

const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://sfhsscioly-default-rtdb.firebaseio.com"
});

const db = firebase.firestore();

function main() {
    const eventName = "Astronomy";
    const assignmentName = "Math~~12345"
    const payload = [
        {
            "type": "mcq",
            "text": "Which of the following is not a type of error correction method?",
            "options": ["Automatic repeat request", "Forward error correction", "Parity bit", "Hybrid schemes", "None of the above"],
            "value": 0,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "How is KL divergence related to the amount of information difference in two distributions P(X) and Q(X)?",
            "value": 1,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "fitb",
            "text": "KL divergence is equivalent to the sum of cross entropy and |~~~~|",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "msq",
            "text": "Random multiple select question",
            "options": [
                "Select me", "No, me", "No, me!!!", "ME!!!!!!!!!!!"
            ],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mq",
            "text": "Just another random matching question",
            "optionsA": [
                "1", "2", "3", "4"
            ],
            "optionsB": [
                "a", "b", "c", "d"
            ],
            "value": 1,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "What quantity can be interpreted as the average amount of information stored in a variable, such as a coin?",
            "value": 0,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "Why is information often encoded before being transmitted? List at least two reasons.",
            "value": 1,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "Why do computers store information in binary (as opposed to ternary or decimal)? List at least one reason.",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "A Markov chain is a good way to organize an alphabet in a way that can be used to create a more efficient encoding of the alphabet compared to random assignment. How could a supposed Markov chain organize the symbols in the alphabet? Select all that apply.",
            "options": ["By plaintext length", "By frequency", "By encoded length", "By cost of communication", "By entropy"],
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "What does the Hamming distance measure?",
            "options": ["The travel distance across a communication channel for information encoded in a radio wave, current, etc.", "The maximum distance a form of information (such as a radio wave or current) can travel before beginning to lose integrity", "The uniqueness of a string of symbols containing information in comparison to an equal-length “informationless” string", "The difference between two strings of symbols in terms of how many symbols are different"],
            "value": 4,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "One way to check the integrity of information received is to generate a checksum using a hash. What central fact about hashes makes this a good way to check if a piece of data has been altered or not?",
            "value": 5,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "If a sender compresses data before transmitting it, does the bitrate of the transmission increase or decrease?",
            "value": 4,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "The graph on the left is the expected signal of a message sent over a cable. The graph on the right is the message that was received. Does this scenario represent noise or distortion?<br><center><img src='https://www.cssa.dev/images/competitions/IT-1.JPG'/></center>",
            "value": 3,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "The graph on the left is the expected signal of a message sent over a cable. The graph on the right is the message that was received. Does this scenario represent noise or distortion?<br><center><img src='https://www.cssa.dev/images/competitions/IT-2.JPG'/></center>",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "A major issue in the development of quantum computing technology is the fact that error correction is now more complicated: quantum computers cannot use redundancy qubits or copy qubit states. What physical law forbids this?",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "What does ITP stand for?",
            "options": ["Internet Transport Protocol", "Internet Transport Policy", "Internet Transmission Protocol", "Internet Transmission Policy"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        }
    ];

    if (payload.length > 0) {
        for (let d = 0; d < payload.length; d++) {
            const docRef = db.doc(`assignments/${eventName}/${assignmentName}/question${d}`);

            docRef.set(payload[d]).then(() => {
                console.log(`Added question #${d}!`);
            }).catch((e) => {
                console.error(e);
            });
        }
    }
}

main();