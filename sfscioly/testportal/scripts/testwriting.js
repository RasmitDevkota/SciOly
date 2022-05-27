const questions = [];

window.addEventListener("onload", () => {

});

function loadQuestion(data) {
    var questionText = `
        <div id="question${n}" class="question">
            <h2>Question ${n}</h2>

            <div class="form-group">
                <label for="cardName">Text</label>
                <input type="text" class="form-control" id="cardName" placeholder="Enter Question Text Here">
            </div>

            <div class="form-group">
                <label for="questionType">Type</label>
                <select class="form-control" id="questionType">
                    <option value="mcq">Multiple Choice Question</option>
                </select>
            </div>

            <input class="btn btn-primary" value="Submit" onclick="saveQuestion('${n}')">
        </div>
    `;
}

function saveQuestion(number) {
    if () {
        alert("You forgot to enter an input for something! Every field is required!");

        return console.log("Not enough parameters given.");
    }

    cards.collection(type.toLowerCase()).doc(number).set(data, { merge: true }).then(function () {
        console.log(`Successfully added card ${name} of type ${type}!`);

        return alert(`Successfully added card ${name} of type ${type}!`);
    }).catch(function (e) {
        console.log(e);

        return alert("Error occurred! Please contact a developer!");
    });
}