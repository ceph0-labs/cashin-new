const socket = io();

const username = "Player" + Math.floor(Math.random() * 1000);
socket.emit("join", username);
const plane = document.getElementById("plane");

let currentMultiplier = 1;

// Canvas setup
const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 300;

let points = [];

//function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    points.forEach((p, i) => {
        let x = i * 5;
        let y = canvas.height - p * 20;

        ctx.lineTo(x, y);

        // Move plane to latest point
        if (i === points.length - 1) {
            plane.style.left = x + "px";
            plane.style.top = y + "px";
        }
    });

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Simulated multiplier growth (temporary)
setInterval(() => {
    currentMultiplier += 0.02;

    document.getElementById("multiplier").innerText =
        currentMultiplier.toFixed(2) + "x";

    points.push(currentMultiplier);

    if (points.length > 150) points.shift();

    drawGraph();

}, 100);

// Bet
function placeBet() {
    let amount = parseFloat(document.getElementById("betAmount").value);
    socket.emit("bet", amount);
}

// Cashout
function cashOut() {
    socket.emit("cashout", currentMultiplier);
}

// Players list
socket.on("players", (players) => {
    const list = document.getElementById("playersList");
    list.innerHTML = "";

    players.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.username + " - Bet: " + p.bet;
        list.appendChild(li);
    });
});

// Cashout display
socket.on("playerCashout", (data) => {
    alert(data.username + " cashed out " + data.amount);
});