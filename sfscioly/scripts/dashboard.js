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

const rtdb = getDatabase();

export function loadBulletinBoard() {
    get(child(ref(rtdb), `bulletinboard`)).then((snapshot) => {
        if (snapshot.exists()) {
            window.bulletinboard = Object.entries(snapshot.val());

            console.log(bulletinboard)

            bulletinboard.forEach((post) => {
                document.getElementById("bulletinboardItemContainer").innerHTML += `
                    <div id="${post[0] + Math.random()}" class="bulletin-board-item">
                        <h1>${post[1]["title"]}</h1>
                        <div>
                            ${post[1]["content"]}
                        </div>
                    </div>
                `;
            });
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

export function joinMailingList() {
    const email = _("mailingListEmailInput").value;
    const name = _("mailingListNameInput").value;

    setDoc(doc(db, "userlists", email), {
        email: email,
        name: name
    }).then(() => {
        alert("Hooray! You're now in our mailing list!");
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}
