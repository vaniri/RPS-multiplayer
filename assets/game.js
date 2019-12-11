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
    $("body").css('backgroundImage','url("")');
    $("#form-container").hide();
    $("#image-container").css('visibility', 'visible');
    $("#user-interaction").css('visibility', 'visible');
    $("#user-interaction").text("Make your choice!");
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
        $("#user-interaction").text(`You chose: ${choice}`);
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
    if (!snapshot.data()) {
        return;
    }

    let users = Object.keys(snapshot.data());
    if (snapshot.data() && users.length === 2) {
        let myUser = $("#nickname").val();
        let myChoice = snapshot.data()[myUser];
        let otherUser = users.filter(el => el !== myUser)[0];
        console.log(snapshot.data());
        console.log(otherUser, myUser);
        let otherUserChoice = snapshot.data()[otherUser];
        console.log(myChoice, otherUserChoice);
        gameLogic(myChoice, otherUserChoice);
        roundRef.set({});
    }
});

const possibleChoices = ["rock", "paper", "scissors"];

const gameTable = createTable();

function createTable() {
    let table = {};
    table["scissors"] = {};
    table["scissors"]["scissors"] = 0;
    table["scissors"]["rock"] = 2;
    table["scissors"]["paper"] = 1;
    table["rock"] = {};
    table["rock"]["scissors"] = 1;
    table["rock"]["rock"] = 0;
    table["rock"]["paper"] = 2;
    table["paper"] = {};
    table["paper"]["scissors"] = 2;
    table["paper"]["rock"] = 1;
    table["paper"]["paper"] = 0;
    return table;
}

function gameLogic(myChoice, otherUserChoice) {
    let result = gameTable[myChoice][otherUserChoice];
    console.log(
        `User entered ${myChoice}, computer chose ${otherUserChoice}, who won? ${result}`
    );

    showMeResult(result);
    console.log(result);
}


function showMeResult(result) {
    const showResult = $('<h1 id="show-result"></h1>');
    console.log(showResult);
    $("#user-interaction").append.showResult;
    if (result === 1) {
        showResult.text("You won!");
    } else if (result === 2) {
        showResult.text("You lose!");
    } else { showResult.text("Draw!") };
} 