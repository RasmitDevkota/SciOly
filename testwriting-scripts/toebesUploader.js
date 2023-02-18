const fs = require("fs");

var admin = require("firebase-admin");
var serviceAccount = require("./sfhsscioly-firebase-adminsdk-vt7yy-dd86ff6389.json");

const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://sfhsscioly-default-rtdb.firebaseio.com"
});

const db = firebase.firestore();

const enAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const esAlphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

main = () => {
    fs.readFile("./toebes.json", "utf8", (err, data) => {
        if (err) {
            return console.log(err);
        }

        const payload = new Array();

        const toebes = JSON.parse(data);

        Object.entries(toebes).forEach(([key, value]) => {
            if (key == "TEST.0") {
                return;
            }

            let qText = value.question;
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
                        for (let pt of value.cipherString.toUpperCase()) {
                            const i = esAlphabet.indexOf(pt);
                            qQuote += (i == -1) ? pt : value.alphabetDest[i];
                        }
                    } else {
                        for (let pt of value.cipherString.toUpperCase()) {
                            const i = enAlphabet.indexOf(pt);
                            console.log(i);
                            qQuote += (i == -1) ? pt : value.alphabetDest[i];
                        }
                    }
                    break;
                case "patristocrat":
                    for (let pt of value.cipherString.toUpperCase()) {
                        const i = enAlphabet.indexOf(pt);
                        qQuote += (i == -1) ? pt : value.alphabetDest[i];
                    }
                    break;
                case "hill":
                    qCipher += `-${value.operation}`;

                    if (value.operation == "encode") {
                        qQuote = value.cipherString;
                    } else {
                        qQuote = encodeHill(value.keyword, value.cipherString);
                    }
                    break;
                case "morbit":
                    let p = 0;
                    Object.entries(value.replacement).forEach(([morse, num]) => {
                        if (value.hint.includes(num)) {
                            p++;

                            qText += `${p == 1 ? " " : ", "}${p == 5 ? "and " : ""}${num}=${morse}`;
                        }
                    });

                    qText += `<br>${value.encoded}`;

                    qType = "lrq";

                    qText += `<br>${value.encoded}`;

                    qType = "lrq";
                    break;
                case "pollux":
                    qText += `${value.dotchars[0]}=., ${value.dotchars[1]}=., `;
                    qText += `${value.dashchars[0]}=-, `;
                    qText += `${value.xchars[0]}=X, and ${value.xchars[1]}=X`;

                    qText += `<br>${value.encoded}`;

                    qType = "lrq";
                    break;
                case "porta":
                    if (value.operation == "encode") {
                        qQuote = value.cipherString;
                    } else {
                        qQuote = encodePorta(value.keyword, value.cipherString);
                    }
                    break;
                case "railfence":
                    qText += `<br>${encodeRailfence(value.rails, value.cipherString)}`;

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
        });

        fs.writeFile("./payload.json", JSON.stringify(payload), (e) => { console.error(e); });

        uploadQuestions(payload);
    });
};

// const payload = [
//     {
//         "text": "Solve this quote which has been encoded with a K1 aristocrat.",
//         "cipher": "aristocrat",
//         "quote": "XLIVI EVI XLVII XLMRKW CSY GER HS MR E FEWIFEPP KEQI. CSY GER AMR, SV CSY GER PSWI, SV MX GER VEMR.",
//         "type": "code",
//         "value": 250,
//         "image": "",
//         "tiebreaker": false,
//     },
//     {
//         "text": "Solve this quote which has been encoded with a K2 aristocrat.",
//         "cipher": "aristocrat",
//         "quote": "QPS SPNH WPEETD IC TKTGNCDT, QJI LWTD CDT WPEETDH IC NCJ, YJHI ZTTE SCXDV NCJG QTHI PDS DTKTG BTI P QPS SPN APZT NCJ UTTB QPS PQCJI NCJGHTBU.",
//         "type": "code",
//         "value": 250,
//         "image": "",
//         "tiebreaker": false,
//     }
// ];

uploadQuestions = async (payload) => {
    const eventName = "Codebusters";
    const assignmentName = `Weekly Practice - February 15th - Parth~~2359893458`;

    const questionOrder = [];

    for (let d = 0; d < payload.length; d++) {
        const questionId = new Date().valueOf().toString() + Math.random().toString().split(".")[1];
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
        questionOrder: questionOrder,
    }).then(() => {
        console.log("Set metadata document!");
    }).catch((e) => {
        console.error(e);
    });
}

encodeHill = (key, quote) => {
    key = key.toUpperCase();
    quote = quote.toUpperCase().replace(/[^A-Z]/g, "");

    let keyMatrix = [parseInt(key[0], 36) - 10, parseInt(key[1], 36) - 10, parseInt(key[2], 36) - 10, parseInt(key[3], 36) - 10];

    let cipherString = "";

    for (let i = 0; i < quote.length; i += 2) {
        const qt0 = enAlphabet[
            ((parseInt(quote[i], 36) - 10) * keyMatrix[0] + (parseInt(quote[i + 1], 36) - 10) * keyMatrix[1]) % 26
        ];
        const qt1 = enAlphabet[
            ((parseInt(quote[i], 36) - 10) * keyMatrix[2] + (parseInt(quote[i + 1], 36) - 10) * keyMatrix[3]) % 26
        ];

        cipherString += qt0;
        cipherString += qt1;
    }

    return cipherString;
};

encodePorta = (key, quote) => {
    key = key.toUpperCase();
    quote = quote.toUpperCase().replace(/[^A-Z]/g, "");

    let keyNumbers = new Array();
    for (let i = 0; i < key.length; i++) {
        keyNumbers.push(Math.floor(enAlphabet.indexOf(key[i % key.length]) / 2));
    }

    const k = keyNumbers.length;

    let cipherString = "";

    for (let i = 0; i < quote.length; i++) {
        if (i > 0 && i % k == 0) {
            cipherString += " ";
        }

        let pt = enAlphabet.indexOf(quote[i]);

        cipherString += enAlphabet[
            pt < 13 ?
            ((pt + keyNumbers[i % k]) % 13 + 13) :
            ((pt - keyNumbers[i % k]) % 13)
        ];
    }

    return cipherString;
};

encodeRailfence = (key, quote) => {
    quote = quote.toUpperCase().replace(/[^A-Z]/g, "");

    const rails = new Array(key).fill("");

    let rowDirection = 1;
    let row = 0;

    for (let i = 0; i < quote.length; i++) {
        rails[row] += quote[i];


        row += rowDirection;

        if ((i != 0 && row == 0) || row == key - 1) {
            rowDirection *= -1;
        }
    }

    let cipherString = rails.join("");

    return cipherString;
};

main()
