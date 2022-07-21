import {
    db,
    _,
    sfsciolylog,
} from "./script.js";

import {
    collection,
    getDocs,
} from 'https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js';

export function loadBulletinBoard(visibility) {
    getDocs(collection(db, "dashboard", visibility, "bulletinboard")).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            document.getElementById("bulletinboardPublicItemContainer").innerHTML += `
            <div id="${doc.id}" class="bulletin-board-item">
                <h1>${doc.data().title}</h1>

                <div>
                    ${doc.data().text}
                </div>
            </div>
        `;
        })
    });
}
