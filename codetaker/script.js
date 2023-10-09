import { LaTeXJSComponent } from "https://cdn.jsdelivr.net/npm/latex.js/dist/latex.mjs";
customElements.define("latex-js", LaTeXJSComponent);

let generated = false;

let startTime;

const enAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const esAlphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const revAlphabet = "ZYXWVUTSRQPONMLKJIHGFEDCBA";
const baconian = {
    "A": "AAAAA",
    "B": "AAAAB",
    "C": "AAABA",
    "D": "AAABB",
    "E": "AABAA",
    "F": "AABAB",
    "G": "AABBA",
    "H": "AABBB",
    "I": "ABAAA",
    "J": "ABAAA",
    "K": "ABAAB",
    "L": "ABABA",
    "M": "ABABB",
    "N": "ABBAA",
    "O": "ABBAB",
    "P": "ABBBA",
    "Q": "ABBBB",
    "R": "BAAAA",
    "S": "BAAAB",
    "T": "BAABA",
    "U": "BAABB",
    "V": "BAABB",
    "W": "BABAA",
    "X": "BABAB",
    "Y": "BABBA",
    "Z": "BABBB",
};
const morse = {
    "A": ".-",
    "B": "-...",
    "C": "-.-.",
    "D": "-..",
    "E": ".",
    "F": "..-.",
    "G": "--.",
    "H": "....",
    "I": "..",
    "J": ".---",
    "K": "-.-",
    "L": ".-..",
    "M": "--",
    "N": "-.",
    "O": "---",
    "P": ".--.",
    "Q": "--.-",
    "R": ".-.",
    "S": "...",
    "T": "-",
    "U": "..-",
    "V": "...-",
    "W": ".--",
    "X": "-..-",
    "Y": "-.--",
    "Z": "--.."
};
const morbitAlphabet = {
    "..": 'OO',
    ".-": 'O-',
    ".X": 'OX',
    "-.": '-O',
    "--": '--',
    "-X": '-X',
    "X.": 'XO',
    "X-": 'X-',
    "XX": 'XX'
};
const toebesAlphabet = {
    "OO": "..",
    "O-": ".-",
    "OX": ".X",
    "-O": "-.",
    "--": "--",
    "-X": "-X",
    "XO": "X.",
    "X-": "X-",
    "XX": "XX"
};
const fracMorse = {
    "A": "•–",
    "B": "–•••",
    "C": "–•–•",
    "D": "–••",
    "E": "•",
    "F": "••–•",
    "G": "––•",
    "H": "••••",
    "I": "••",
    "J": "•–––",
    "K": "–•–",
    "L": "•–••",
    "M": "––",
    "N": "–•",
    "O": "–––",
    "P": "•––•",
    "Q": "––•–",
    "R": "•–•",
    "S": "•••",
    "T": "–",
    "U": "••–",
    "V": "•••–",
    "W": "•––",
    "X": "–••–",
    "Y": "–•––",
    "Z": "––••"
};
const nihilistAlphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

export function importToebesTest() {
    if (generated) {
        return alert("A test is being loaded or has been loaded already. To load a new one, please refresh the page.");
    } else {
        generated = true;
    }

    const toebesFile = document.getElementById("toebesFile").files[0];
    const fileReader = new FileReader();

    fileReader.addEventListener("load", (fileLoadedEvent) => {
        const toebesPayload = JSON.parse(fileLoadedEvent.target.result);

        processToebesPayload(fileLoadedEvent.target.fileName, toebesPayload);
    });

    fileReader.readAsText(toebesFile, "UTF-8");
}

export function genCodebuilderTest() {
    if (generated) {
        return alert("A test is being generated or has been generated already. To generate a new one, please refresh the page.");
    } else {
        generated = true;
    }

    const preset = document.getElementById("preset").innerText;

    fetch(`https://codebuilderweb.dralientech.repl.co/gen.json?preset=${preset}`, {
        method: "POST",
        headers: {
            "Referer": "https://codetaker.web.app/",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        },
    })
    .then((response) => {
        console.log(response);

        return response.json();
    })
    .then((toebesPayload) => processToebesPayload("CodeTaker", toebesPayload))
    .catch((e) => {
        if (e.name == "SyntaxError") {
            alert("It looks like an error occurred generating the test. " +
                "This probably happened because your preset is invalid. " +
                "Please make sure that your preset is a valid Codebuilder Immortal preset.");
        } else {
            alert("Error occurred! Contact Rasmit#0811 on Discord for help.");
        }

        console.error(e);
    });
}

export async function processToebesPayload(testName, toebesPayload) {
    let payload = new Array();

    for (const key in toebesPayload) {
        if (key == "TEST.0") {
            continue;
        }

        const value = toebesPayload[key];

        let qText = value.question.replace(/<p>/g, "");
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
                    qQuote = value.cipherString
                        .toUpperCase()
                        .normalize("NFKD")
                        .replace(/[\u0300-\u0302]|[\u0304-\u036f]/g, "")
                        .replace(/N\u0303/g, "Ñ")
                        .split("")
                        .map(letter => new RegExp(/[A-Z\u00d1]/g).test(letter)
                            ? value.replacement[letter]
                            : letter
                        )
                        .join("");
                } else {
                    for (let pt of value.cipherString.toUpperCase()) {
                        const i = enAlphabet.indexOf(pt);
                        qQuote += (i == -1) ? pt : value.alphabetDest[i];
                    }
                }
                break;
            case "patristocrat":
                qQuote = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .split("")
                    .map(letter => value.replacement[letter])
                    .join("")
                    .match(/.{1,5}/g)
                    .join(" ");
                break;
            case "hill":
                if (value.question.includes("Compute the decryption matrix") || value.cipherString == "") {
                    qType = "lrq";
                } else {
                    qCipher += `-${value.operation}`;

                    if (value.operation == "encode") {
                        qQuote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");
                    } else {
                        qQuote = encodeHill(value.keyword, value.cipherString);
                    }
                }
                break;
            case "pollux":
                const splitTextPollux = qText.split(".");
                if (splitTextPollux[1].includes("=") || !Object.keys(value).includes("crib")) {
                    qText = `${splitTextPollux[0]}. `;

                    qText += `${value.dotchars[0]}=., ${value.dotchars[1]}=., `;
                    qText += `${value.dashchars[0]}=-, `;
                    qText += `${value.xchars[0]}=X, and ${value.xchars[1]}=X</p>`;
                }

                qText += `${value.encoded.split("").join(" ")}`;

                qType = "lrq";
                break;
            case "morbit":
                const splitTextMorbit = qText.split(". ");
                if (splitTextMorbit[1].includes("matches to") || splitTextMorbit[1].includes("O")) {
                    qText = splitTextMorbit[0] + ". ";

                    let p = 0;
                    Object.entries(value.replacement).forEach(([morse, num]) => {
                        if (value.hint.includes(num)) {
                            p++;

                            qText += `${p <= 1 ? " " : ", "}${p == 5 ? "and " : ""}${num}=${toebesAlphabet[morse]}`;
                        }
                    });

                    qText += `</p>`;
                }

                let morseTextMorbit = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z ]/g, "")
                    .split("")
                    .map(letter => {
                        return letter == " " ? "X" : `${morse[letter]}X`;
                    })
                    .join("");

                if (morseTextMorbit.length % 2 != 0) {
                    morseTextMorbit += "X";
                }

                for (let i = 0; i < morseTextMorbit.length; i += 2) {
                    qText += value.replacement[morbitAlphabet[morseTextMorbit.substring(i, i + 2)]];
                    qText += " ";
                }

                qType = "lrq";
                break;
            case "fractionatedmorse":
                // Backwards compatability with old, buggy Codebuilder Fractionated Morse generator
                if (!qText.includes("</p>")) {
                    qText += "</p>";
                }

                let morseTextFracMorse = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z ]/g, "")
                    .split("")
                    .map(letter => {
                        return letter == " " ? "×" : `${fracMorse[letter]}×`;
                    })
                    .join("");

                if (morseTextFracMorse.endsWith("×")) {
                    morseTextFracMorse = morseTextFracMorse.slice(0, -1);
                } else if (morseTextFracMorse.endsWith("××")) {
                    morseTextFracMorse = morseTextFracMorse.slice(0, -2);
                }

                if (morseTextFracMorse.length % 3 == 1) {
                    morseTextFracMorse += "××";
                } else if (morseTextFracMorse.length % 3 == 2) {
                    morseTextFracMorse += "×";
                }

                let replacement = value.replacement;

                // Backwards compatability with old, buggy Codebuilder Fractionated Morse generator
                if (Object.keys(replacement).includes("...")) {
                    for (let morseFraction of [
                        "...", "..-", "..X", ".-.", ".--", ".-X", ".X.", ".X-", ".XX", "-..",
                        "-.-", "-.X", "--.", "---", "--X", "-X.", "-X-", "-XX", "X..", "X.-",
                        "X.X", "X-.", "X--", "X-X", "XX.", "XX-"
                    ]) {
                        replacement[
                            morseFraction.replace(/\./g, "•").replace(/-/g, "–").replace(/X/g, "×")
                        ] = replacement[morseFraction];

                        delete replacement[morseFraction];
                    }
                }

                for (let i = 0; i < morseTextFracMorse.length; i += 3) {
                    qText += replacement[morseTextFracMorse.substring(i, i + 3)];
                    qText += " ";
                }

                qType = "lrq";
                break;
            case "porta":
                if (value.operation == "encode") {
                    qQuote = value.cipherString
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")
                        .match(new RegExp(`.{1,${value.blocksize}}`, "g"))
                        .join(" ");
                } else {
                    const keyword = value.keyword.toUpperCase();
                    const quote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");

                    let keyNumbers = new Array();
                    for (let i = 0; i < keyword.length; i++) {
                        keyNumbers.push(Math.floor(enAlphabet.indexOf(keyword[i % keyword.length]) / 2));
                    }

                    const k = keyNumbers.length;

                    for (let i = 0; i < quote.length; i++) {
                        if (i > 0 && i % k == 0) {
                            qQuote += " ";
                        }

                        let pt = enAlphabet.indexOf(quote[i]);

                        qQuote += enAlphabet[
                            pt < 13 ?
                                ((pt + keyNumbers[i % k]) % 13 + 13) :
                                ((pt - keyNumbers[i % k]) % 13)
                        ];
                    }
                }
                break;
            case "railfence":
                qQuote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");

                const railsArray = new Array(value.rails).fill("");

                let rowDirection = 1;
                const row = 0;

                for (let i = 0; i < quote.length; i++) {
                    railsArray[row] += value.cipherString[i];

                    row += rowDirection;

                    if ((i != 0 && row == 0) || row == value.rails - 1) {
                        rowDirection *= -1;
                    }
                }

                qText += railsArray.join("");

                qType = "lrq";
                break;
            case "compcolumnar":
                qQuote = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");
                value.keyword = value.keyword.toUpperCase();

                for (let o = 0; o < value.railOffset; o++) {
                    qQuote = " " + qQuote;
                }

                const qQuoteArr = qQuote.split("");
                const qQuoteRows = new Array();
                while (qQuoteArr.length) qQuoteRows.push(qQuoteArr.splice(0, value.keyword.length));

                let ciphertext = "";
                for (let letter of enAlphabet) {
                    for (let kl in value.keyword){
                        if (value.keyword[kl] == letter) {
                            for (let r in qQuoteRows) {
                                ciphertext += qQuoteRows[r][kl] ?? "";
                            }
                        }
                    }
                }

                qText += ciphertext;

                qType = "lrq";
                break;
            case "nihilistsub":
                let polybiusSquareString = value.polybiusKey;
                for (let abc of nihilistAlphabet) {
                    if (!value.polybiusKey.includes(abc)) {
                        polybiusSquareString += abc;
                    }
                }

                let polybiusSquareArray = polybiusSquareString.split("");
                let polybiusSquareMatrix = new Array();
                while (polybiusSquareArray.length) polybiusSquareMatrix.push(polybiusSquareArray.splice(0,5));

                const polybiusSquare = {};
                for (let i = 0; i < 5; i++) {
                    let row = i + 1;

                    for (let j = 0; j < 5; j++) {
                        let column = j + 1;

                        polybiusSquare[polybiusSquareMatrix[i][j]] = Number(`${row}${column}`);
                    }
                }

                let k = 0;
                for (let pt of value.cipherString) {
                    let ptNum = polybiusSquare[pt];
                    let keywordNum = polybiusSquare[value.keyword[k]];
                    let sum = ptNum + keywordNum
                    qQuote += `${sum}`;

                    k = (k + 1) % value.keyword.length;
                }

                qText += qQuote;

                qType = "lrq";

                break;
            case "atbash":
                for (let pt of value.cipherString.toUpperCase()) {
                    const i = enAlphabet.indexOf(pt);
                    qQuote += (i == -1) ? pt : revAlphabet[i];
                }
                break;
            case "caesar":
                for (let pt of value.cipherString.toUpperCase()) {
                    const i = enAlphabet.indexOf(pt);
                    qQuote += (i == -1) ? pt : enAlphabet[(i + value.offset) % 26];
                }
                break;
            case "vigenere":
                if (value.operation == "encode") {
                    qQuote = value.cipherString
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")
                        .match(new RegExp(`.{1,${value.blocksize}}`, "g"))
                        .join(" ");
                } else {
                    const keynums = value.keyword.toUpperCase().split("").map(keyLetter => enAlphabet.indexOf(keyLetter));

                    const plaintext = value.cipherString.toUpperCase().replace(/[^A-Z]/g, "");

                    for (let l in plaintext) {
                        if (l % value.blocksize == 0 && l != 0) {
                            qQuote += " ";
                        }

                        const pt = plaintext[l];

                        const i = enAlphabet.indexOf(pt);
                        qQuote += (i == -1) ? "" : enAlphabet[(i + keynums[l % value.blocksize]) % 26];
                    }
                }
                break;
            case "affine":
                if (value.operation == "encode") {
                    qQuote = value.cipherString.toUpperCase();
                } else {
                    for (let pt of value.cipherString.toUpperCase()) {
                        const i = enAlphabet.indexOf(pt);
                        qQuote += (i == -1) ? pt : enAlphabet[(value.a * enAlphabet.indexOf(pt) + value.b) % 26];
                    }
                }
                break;
            case "baconian":
                const encoded = value.cipherString
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .split("")
                    .map(letter => {
                        const abMapping = baconian[letter];
                        return abMapping.split("").map(ab => {
                            return ab == "A"
                                ? value.texta[Math.floor(Math.random() * value.texta.length)]
                                : value.textb[Math.floor(Math.random() * value.textb.length)];
                        }).join("");
                    })
                    .join("");

                qText += `${encoded}`;

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
    };

    loadTest(testName, payload);
}

export async function loadTest(testName, payload) {
    document.getElementById("title").innerHTML = testName ?? "CodeTaker";

    const testContainer = document.getElementById("test-container");

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

    document.getElementById("referenceSheetDoc").src = "https://scilympiad.com/Data/shared/testRefs/CodebustersRef2023.pdf";

    document.getElementById("referenceSheet").style.margin = "0%";
    document.getElementById("referenceSheet").style.padding = "0%";

    document.getElementById("referenceSheetDoc").style.width = "99%";
    document.getElementById("referenceSheetDoc").style.height = "99%";

    let questionNumber = 0;

    for (const questionIndex in payload) {
        if (questionIndex != 0) {
            testContainer.innerHTML += `<hr>`;
        }

        const data = await payload[questionIndex];

        questionNumber += await data.type == "text" ? 0 : 1;

        switch (data.type) {
            case "text":
                var question = `
                    <div class="question text">
                        <div class="question-text">
                            ${data.text}
                        </div>
                    </div>
                `;

                testContainer.innerHTML += question;
                break;
            case "lrq":
                var question = `
                    <div class="question lrq">
                        <div class="question-text">
                            ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                        </div>
                        <div class="answer lrq-answer">
                            <div class="form-group">
                                <textarea class="form-control" id="${testName + questionIndex}-response" rows="5"></textarea>
                            </div>
                        </div>
                `;

                if (data.cipher == "fractionatedmorse") {
                    const topRow = `
                        <td style="padding: 0vh 0.5vw;">Replacement</td>
                    ` + `
                        <td>
                            <input class="code-answer" type="text" maxlength="1" autocapitalize="word">
                        </td>
                    `.repeat(26);

                    const bottomRow = `
                        <td style="padding: 0vh 0.5vw;">Morse</td>
                        <td>•<br>•<br>•</td>
                        <td>•<br>•<br>–</td>
                        <td>•<br>•<br>×</td>
                        <td>•<br>–<br>•</td>
                        <td>•<br>–<br>–</td>
                        <td>•<br>–<br>×</td>
                        <td>•<br>×<br>•</td>
                        <td>•<br>×<br>–</td>
                        <td>•<br>×<br>×</td>
                        <td>–<br>•<br>•</td>
                        <td>–<br>•<br>–</td>
                        <td>–<br>•<br>×</td>
                        <td>–<br>–<br>•</td>
                        <td>–<br>–<br>–</td>
                        <td>–<br>–<br>×</td>
                        <td>–<br>×<br>•</td>
                        <td>–<br>×<br>–</td>
                        <td>–<br>×<br>×</td>
                        <td>×<br>•<br>•</td>
                        <td>×<br>•<br>–</td>
                        <td>×<br>•<br>×</td>
                        <td>×<br>–<br>•</td>
                        <td>×<br>–<br>–</td>
                        <td>×<br>–<br>×</td>
                        <td>×<br>×<br>•</td>
                        <td>×<br>×<br>–</td>
                    `;

                    question += `
                        <br>
                        <div style="display: flex; justify-content: center;">
                            <table cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                    ${topRow}
                                    </tr>
                                    <tr>
                                    ${bottomRow}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                question += `
                    </div >
                `;

                testContainer.innerHTML += question;
                break;
            case "code":
                var question = `
                    <div class="question code">
                `;

                question += `
                        <div class="question-text">
                            ${questionNumber}. (${data.value} point${(data.value != 1) ? "s" : ""}) ${data.text}
                        </div>
                `;

                question += `
                        <div class="answer code-answer">
                `;

                const quote = await data.quote;
                const quoteArray = data.cipher == "patristocrat"
                    ? quote.replace(/[^a-zA-Z]/g, "").match(/.{1,5}/g)
                    : quote.split(new RegExp(" ", "g"));

                for (let i in quoteArray) {
                    const quoteWord = await quoteArray[i];

                    let topRow = ``;
                    let bottomRow = ``;

                    for (let j in quoteWord) {
                        let qt = await quoteWord[j];

                        if (await qt.match(/[a-zA-Z\u00f1\u00d1]/i)) {
                            topRow += `
                                <td id="topRow${i}${j}">${qt}</td>
                            `;

                            bottomRow += `
                                <td>
                                    <input id="${testName + questionIndex}-input${i}.${j}" class="code-answer" type="text" name="${testName + questionIndex}-input${i}.${j}"
                                        maxlength="1" autocapitalize="word">
                                </td>
                            `;
                        } else {
                            topRow += `
                                <td id="topRow${i}${j}">${qt}</td>
                            `;

                            bottomRow += `
                                <td>

                                </td>
                            `;
                        }
                    }

                    question += `
                        <table cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    ${topRow}
                                </tr>
                                <tr>
                                    ${bottomRow}
                                </tr>
                            </tbody>
                        </table>
                    `;
                }

                question += `
                    </div>
                `;

                if (["aristocrat", "patristocrat", "xenocrypt"].includes(data.cipher)) {
                    let topRow = `<td style="padding: 0vh 0.5vw;">Letter</td>`;
                    let middleRow = `<td style="padding: 0vh 0.5vw;">Substitution</td>`;
                    let bottomRow = `<td style="padding: 0vh 0.5vw;">Frequency</td>`;

                    const alphabet = `ABCDEFGHIJKLMN${data.cipher == "xenocrypt" ? "Ñ" : ""}OPQRSTUVWXYZ`;

                    for (let l in alphabet) {
                        const letter = alphabet[l];
                        const freq = (quote.match(new RegExp(letter, "gi")) ?? "").length;

                        topRow += `<td>${letter}</td>`

                        middleRow += `
                            <td>
                                <input class="code-answer" type="text" maxlength="1" autocapitalize="word">
                            </td>
                        `

                        bottomRow += `<td>${freq}</td>`;
                    }

                    question += `
                        <div style="display: flex; justify-content: center;">
                            <table cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                    ${topRow}
                                    </tr>
                                    <tr>
                                    ${middleRow}
                                    </tr>
                                    <tr>
                                    ${bottomRow}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                question += `
                    </div>
                `;

                testContainer.innerHTML += question;
                break;
            default:
                alert("An error occurred preparing the test! Please contact Rasmit#0811 on Discord for assistance!");
        }

        console.log(questionIndex);
    }

    // @TODO - Implement save retrieval from localStorage

    document.getElementById("test").style.display = "flex";

    startTime = Date.now();

    setInterval(async () => {
        timer();
    }, 1000);
}

async function timer() {
    let timeElapsed = Date.now() - startTime;
    let minutes = Math.floor(timeElapsed / 1000 / 60);
    let seconds = Math.floor(timeElapsed / 1000) % 60;

    let timeText = `${minutes} minute${(minutes == 1) ? "" : "s"} and ${seconds} second${(seconds == 1) ? "" : "s"}`;

    document.getElementById("details").innerHTML = `Time Elapsed: ${timeText}`;
}

// @TODO - Implement save using localStorage
//       - window.localStorage.setItem(saveName, JSON.stringify(data))

// @TODO - Implement submit/check

const encodeHill = (key, quote) => {
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
