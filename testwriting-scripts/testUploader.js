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
        },
        {
            "type": "mcq",
            "text": "Which of the following is not a type of error correction method?",
            "options": ["Automatic repeat request", "Forward error correction", "Parity bit", "Hybrid schemes", "None of the above"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "What does KL divergence measure?",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "How is KL divergence related to the amount of information difference in two distributions P(X) and Q(X)?",
            "value": 2,
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
            "type": "fitb",
            "text": "|~~~~| is the negative part of KL divergence.",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "Can the Shannon entropy of a variable be 0? If so, what would this tell you about the variable?",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Is the order of the probability distributions important in calculating KL divergence?",
            "options": ["Yes", "No"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "Calculate the KL divergence of the distributions P(x) and Q(x) shown below.<br><center><img src='https://www.cssa.dev/images/competitions/IT-3.JPG'/></center><br>",
                "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "What does the mutual information of two probability distributions P(X) and Q(X) tell you?",
            "options": ["How similar the distributions are in shape and spread", "The amount of information you can deduct about a variable following one of the distributions from the value of the other variable", "The amount of information that can be contained in both of the distributions together but not by themselves", "The amount of information that is the “same” between two variable values that follow P(X) and Q(X)"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "In Information Theory, the measure of information gained is a number in the [0,1] range. What does a transmission of 0 bits mean?",
            "options": ["No information was gained", "The most information was gained"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Which of the following items matches A in the diagram below?<br><center><img src='https://www.cssa.dev/images/competitions/IT-4.JPG'/></center><br>",
                "options": ["Receiver", "Transmitter", "Signal", "Noise Source"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Which of the following items matches B in the diagram below?<br><center><img src='https://www.cssa.dev/images/competitions/IT-4.JPG'/></center><br>",
                "options": ["Receiver", "Transmitter", "Signal", "Noise Source"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Which of the following items matches C in the diagram below?<br><center><img src='https://www.cssa.dev/images/competitions/IT-4.JPG'/></center><br>",
            "options": ["Receiver", "Transmitter", "Signal", "Noise Source"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "Which of the following items matches D in the diagram below?<br><center><img src='https://www.cssa.dev/images/competitions/IT-4.JPG'/></center><br>",
                "options": ["Receiver", "Transmitter", "Signal", "Noise Source"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "How can signal distortion be corrected if the distortion effect is known mathematically? Although more than one of these could be correct, select the best option.",
            "options": ["Using an error-correcting code", "Using the inverse function of the distortion effect", "Using the negation of the distortion effect", "Using the reciprocal of the distortion effect"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "lrq",
            "text": "What is the difference between source coding and channel coding?",
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "What is the theorem that states the maximum amount of information that can be communicated through a channel without noise?",
            "options": ["Channel coding theorem", "Noiseless coding theorem", "Noisy coding theorem", "Noiseless communication theorem"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "A decoder is primarily used for image _____?",
            "options": ["Compression", "Decompression", "Enhancement", "Transmission"],
            "value": 2,
            "image": "",
            "tiebreaker": false
        },
        {
            "type": "mcq",
            "text": "How does a multicast channel differ from a unicast channel?",
            "options": ["A multicast channel has multiple senders and receivers", "A multicast channel has one sender and multiple receivers", "A multicast channel has multiple senders and one receiver", "A multicast channel has multiple senders acting on behalf of a single sender"],
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