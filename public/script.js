const socket = io();

// Example username (later we improve)
const username = "Player" + Math.floor(Math.random() * 1000);

socket.emit("join", username);

// Place bet
function placeBet(amount) {
    socket.emit("bet", amount);
}

// Cashout
function cashOut(multiplier) {
    socket.emit("cashout", multiplier);
}

// Listen for players
socket.on("players", (players) => {
    console.log("Players:", players);
});

// Listen for cashouts
socket.on("playerCashout", (data) => {
    console.log(data.username + " cashed out " + data.amount);
});
let balance = 1000;
let betAmount = 0;
let playing = false;
let multiplier = 1;
let crashPoint = 0;

const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 300;

let x = 0;

function updateBalance() {
    document.getElementById("balance").innerText = "Balance: " + balance + " KES";
}

// 👉 BET (min 100 KES)
function placeBet() {
    let bet = Number(document.getElementById("bet").value);

    if (bet < 100) {
        alert("Minimum bet is 100 KES");
        return;
    }

    if (bet > balance) {
        alert("Insufficient balance");
        return;
    }

    betAmount = bet;
    balance -= bet;
    updateBalance();

    startRound();
}

function startRound() {
    playing = true;
    multiplier = 1;
    x = 0;

    // crash logic
    crashPoint = (Math.random() * 5 + 1).toFixed(2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let interval = setInterval(() => {
        multiplier += 0.02;

        document.getElementById("multiplier").innerText =
            multiplier.toFixed(2) + "x";

        let y = canvas.height - multiplier * 40;

        ctx.lineTo(x, y);
        ctx.strokeStyle = "lime";
        ctx.stroke();

        x += 4;

        if (multiplier >= crashPoint) {
            clearInterval(interval);
            playing = false;
            alert("CRASHED at " + crashPoint + "x");
        }

    }, 100);
}

// 👉 CASHOUT
function cashOut() {
    if (!playing) return;

    let win = betAmount * multiplier;

    balance += win;
    updateBalance();

    playing = false;

    alert("You cashed out: " + win.toFixed(2) + " KES");
}