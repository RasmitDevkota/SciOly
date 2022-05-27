const fs = require('fs');

testJsonSchema = {
    "questions": [
        {
            "type": "mcq",
            "text": "",
            "options": [
                "",
                "",
                "",
                ""
            ],
            "value": 0
        },
        {
            "type": "fitb",
            "text": "",
            "value": 0
        },
        {
            "type": "tf",
            "text": "",
            "value": 0
        },
        {
            "type": "saq",
            "text": "",
            "value": 0
        }
    ]
};

testJson = {

};

testText = ``;

const questions = testJson["questions"];

for (question of questions) {
    switch (question["type"]) {
        case "mcq":
            testText += `
                \\question[${question["value"]}] ${question["text"]}

                \\begin{choices}
            `;

            for (option of question["options"]) {
                testText += `
                    \\choice ${option}
                `;
            }

            testText += `
                \\end{choices}

                \\begin{solution}
                \\textbf{} \\\

                \\end{solution}
            `;
            break;
        case "fitb":
            testText += `
                \\question[${question["value"]}] ${question["text"].replace(/_/g, "\\rule{3cm}{0.15mm}")}

                \\begin{solution}

                \\end{solution}
            `;
            break;
        case "tf":
            testText += `
                \\question[${question["value"]}] \\textbf{True or False} - ${question["text"]}. If this statement is false, modify it to make it true.

                % \\vspace{0.5in}

                \\begin{solution}

                \\end{solution}
            `;
            break;
        case "tf-nomod":
            testText += `
                \\question[${question["value"]}] \\textbf{True or False} - ${question["text"]}.

                \\begin{solution}

                \\end{solution}
            `;
            break;
        case "saq":
            testText += `
                \\question[] ${question["text"]}

                % \\vspace{0.5in}

                \\begin{solution}

                \\end{solution}
            `;
            break;
    }
}

fs.writeFile(`./test_${new Date().getUTCMilliseconds()}.txt`, testText, err => {
    if (err) {
        return console.error(err);
    } else {
        return console.log("Test LaTeXified successfully!");
    }
});