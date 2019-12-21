const WIN = 1;
const LOSE = 2;
const DRAW = 0;
let lostSeries = 0;

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
        $("body").css('backgroundImage', 'linear-gradient(to right, navy, #94A5AD');
        $("#start-container").hide();
        $("#game-chat-container").css('visibility', 'visible');
        $("#user-interaction").text("Make your choice!");
        db.collection("players").doc($("#nickname").val()).set({
            won: 0,
            lose: 0
        }).catch(function (error) {
            console.error("Error adding document: ", error)
        });

        const players = db.collection("players").doc($("#nickname").val());
        players.onSnapshot (snapshot => {
            $("#user-score").html(`won: ${snapshot.data().won} <br> lost: ${snapshot.data().lose}`);
        })

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
            if (choice === "rock") {
                console.log(111);
                $("#image-container").append('<img class="choice-img" src="assets/image/giphy.gif" width="400" height="330"/>');
            }
            if (choice === "paper") {
                console.log(111);
                $("#image-container").append('<img class="choice-img" src="assets/image/squidward-paper-kiss.gif" width="400" height="330"/>');
            }
            if (choice === "scissors") {
                console.log(111);
                $("#image-container").append('<img class="choice-img" src="assets/image/17547.gif" width="400" height="330"/>');
            }
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
        let otherUserChoice = snapshot.data()[otherUser];
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
        lostSeries = 0;
        starNewRound();
    } else if (result === LOSE) {
        db.collection("players").doc($("#nickname").val()).update({ lose: firebase.firestore.FieldValue.increment(1) });
        showResult.text("You lost !");
        lostSeries ++;
        if (lostSeries === 2) {
            $(".choice-img").remove();
            $("#image-container").append('<iframe id="movie" src="https://giphy.com/embed/4wQJjaZy08YOQ" width="500" height="270" frameBorder="0" allowFullScreen></iframe>');
            showResult.text("You lost !");
            $("#user-interaction").text("Don't give up!");
        }
        starNewRound();
    } else {
        showResult.text("Draw!");
        lostSeries = 0;
        starNewRound();
    };
}

function starNewRound() {
    // $("#image-container").append('<img src="assets/image/tie-game.gif" width="320vw" height="300vw"/>');
    $("#restart").show();
    $("#restart").on("click", () => {
        $(".choice-img").remove();
        $("#movie").remove();
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
    let chatInput = $("#chat-input").val();
    let updateChat = { message: chatInput, nick: myUser };
    console.log("sending " + JSON.stringify(updateChat));
    chatRef.update({
        messages: firebase.firestore.FieldValue.arrayUnion(updateChat)
    }).catch(err => console.log("Error storing chat message: " + err));
}


chatRef.onSnapshot(snapshot => {
    console.log("Got chat snapshot: " + JSON.stringify(snapshot.data()));
    if (!snapshot.data()) {
        return;
    }
    $("#chat-section").text("");
    for(let prop of snapshot.data().messages) {
        $("#chat-section").prepend(`<p id="message">${prop.nick}: ${prop.message}</p>`);
        if (prop.nick === $("#nickname").val()) {
            $("#message").css('color', 'cyan');
        }  
    }
})