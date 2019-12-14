
const WIN = 1;
const LOSE = 2;
const DRAW = 0;

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

window.onload = () => { startGame(); }

const chatRef = db.collection("rounds").doc("chat");

function startGame() {
    $("#restart").hide();
    $("#submit").on("click", event => {
        event.preventDefault();
        if(($("#nickname").val()) === "") { return; }
        $("body").css('backgroundImage', 'linear-gradient(to right, navy, aqua, #94A5AD');
        $("#form-container").hide();
        $("#game-container").css('visibility', 'visible');
        $("#chat-container").css('visibility', 'visible');
        $("#user-interaction").text("Make your choice!");
        db.collection("players").doc($("#nickname").val()).set({
            won: 0,
            lose: 0
        }).catch(function (error) {
            console.error("Error adding document: ", error);
        });

        chatRef.set({ messages: [] });

        handleChoice();
    })
}

function handleChoice() {
    $(".choice-image").each(function () {
        $(this).on("click", () => {
            let choice = $(this).attr('data-item');
            $("#user-interaction").text(`You chose: ${choice}`);
            storeChoice(choice);
            $(".choice-image").hide();
            storeChoice(choice);
        });
    })
}

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
    table["scissors"]["scissors"] = DRAW;
    table["scissors"]["rock"] = LOSE;
    table["scissors"]["paper"] = WIN;
    table["rock"] = {};
    table["rock"]["scissors"] = WIN;
    table["rock"]["rock"] = DRAW;
    table["rock"]["paper"] = LOSE;
    table["paper"] = {};
    table["paper"]["scissors"] = LOSE;
    table["paper"]["rock"] = WIN;
    table["paper"]["paper"] = DRAW;
    return table;
}

function gameLogic(myChoice, otherUserChoice) {
    let result = gameTable[myChoice][otherUserChoice];
    showMeResult(result);
}

function showMeResult(result) {
    let showResult = $('<h1 id="show-result"></h1>');
    $("#user-interaction").append(showResult);
    if (result === WIN) {
        db.collection("players").doc($("#nickname").val()).update({ won: firebase.firestore.FieldValue.increment(1) });
        showResult.text("You won!");
        starNewRound();
    } else if (result === LOSE) {
        db.collection("players").doc($("#nickname").val()).update({ lose: firebase.firestore.FieldValue.increment(1) });
        showResult.text("You lost !");
        $("#user-interaction").text("");
        starNewRound();
    } else {
        showResult.text("Draw!");
        starNewRound();
    };
}

function starNewRound() {
    $("#restart").show();
    $("#restart").on("click", () => {
        $(".choice-image").show();
        $("#user-interaction").text("Make your choice!");
        $(".choice-image").each(function () { $(this).on() });
        $("#restart").hide();
        $("#show-result").hide();
    })
}

$("#chat-button").on("click", () => {
    event.preventDefault();
    chat();
})

function chat() {
    let myUser = $("#nickname").val();
    let chatInput = $("#chat").val();
    let updateChat = {message: chatInput, nick: myUser };
    chatRef.update({
        messages: firebase.firestore.FieldValue.arrayUnion(updateChat)
    }).catch(err => console.log("Error storing chat message: " + err));
    for(let prop in updateChat) {
    console.log(updateChat[prop]);
    $("#chat-section").prepend(`${updateChat[prop]} `);
    $("#chat-section").prepend($("<br>"));

    }
}


chatRef.onSnapshot(snapshot => {
    console.log("Got chat snapshot: " + JSON.stringify(snapshot.data()));
    if (!snapshot.data()) {
        return;
    }
})