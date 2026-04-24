const socket = io();

let currentUser = "";

const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 300;

let x = 0;

const plane = document.getElementById("plane");

const takeoff = document.getElementById("takeoff");
const flying = document.getElementById("flying");
const crashSound = document.getElementById("crashSound");
const cashSound = document.getElementById("cashSound");

// AUTH
async function register() {
    await fetch("/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    });
}

async function login() {
    const res = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    });

    const data = await res.json();

    if (data.success) {
        currentUser = username.value;
        socket.emit("join", currentUser);
        loadBalance();
    }
}

async function loadBalance() {
    const res = await fetch("/balance");
    const data = await res.json();
    balance.innerText = "Balance: " + data.balance;
}

// BET
async function placeBet() {
    await fetch("/bet", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ amount: betAmount.value })
    });

    loadBalance();
}

// CASHOUT
function cashOut() {
    socket.emit("cashout");
}

// GAME
socket.on("roundStart", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    x = 0;
    takeoff.play();
    flying.play();
});

socket.on("multiplier", (v) => {
    multiplier.innerText = v + "x";

    let y = canvas.height - (Math.log(v) * 100);

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.stroke();

    plane.style.left = x + "px";
    plane.style.top = y + "px";

    x += 4;
});

socket.on("crash", () => {
    flying.pause();
    crashSound.play();
});

socket.on("cashed", () => {
    cashSound.play();
});
