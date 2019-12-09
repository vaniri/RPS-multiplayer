const firebaseConfig = {
    apiKey: "AIzaSyC-LjUca_JPCrvoEIn_WkDFeJ6n2ocaWho",
    authDomain: "rps-game-1.firebaseapp.com",
    databaseURL: "https://rps-game-1.firebaseio.com",
    projectId: "rps-game-1",
    storageBucket: "rps-game-1.appspot.com",
    messagingSenderId: "147339502945",
    appId: "1:147339502945:web:e395de3777bb990ad65120"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

$("#submit").on("click", event => {
    event.preventDefault();
    db.collection("players").doc($("#nickname").val()).set({
        win: 0,
        lose: 0
    }).catch(function (error) {
        console.error("Error adding document: ", error);
    });
});

$(".choice-image").each(function () {
    $(this).on("click", () => {
        let choice = $(this).attr('data-item');
        storeChoice(choice);
    })
});

const roundRef = db.collection("rounds").doc("round");

function storeChoice(choice) {
    let updateObj = {};
    updateObj[$("#nickname").val()] = choice;

    roundRef.get().then(doc => {
        if (!doc.exists) {
            console.log("Round didn't exist, creating...");
            return roundRef.set(updateObj);
        } else {
            return roundRef.update(updateObj);
        }
    }).catch(err => console.log("Error storing round: " + err));
}

roundRef.onSnapshot(snapshot => {
    console.log("Got snapshot: " + JSON.stringify(snapshot.data()));
});

