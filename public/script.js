const socket = io();

let currentMultiplier = 1;
let points = [];
let gameRunning = false;
let crashPoint = 0;
let hasBet = false;

// Wait for DOM
window.onload = () => {

    const canvas = document.getElementById("graph");
    const ctx = canvas.getContext("2d");
    const plane = document.getElementById("plane");

    canvas.width = 800;
    canvas.height = 300;

    // 🎮 START GAME
    function startGame() {
        currentMultiplier = 1;
        points = [];
        gameRunning = true;
        hasBet = false;

        // Random crash between 1.5x and 5.0x
        crashPoint = parseFloat((Math.random() * 3.5 + 1.5).toFixed(2));

        console.log("Crash at:", crashPoint);

        // Reset plane position
        if (plane) {
            plane.style.left = "0px";
            plane.style.top = "260px";
            plane.style.transform = "rotate(20deg)";
        }

        document.getElementById("multiplier").innerText = "1.00x";
    }

    // 📈 DRAW GRAPH + MOVE PLANE
    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        points.forEach((p, i) => {
            let x = i * 5;
            let y = canvas.height - p * 20;

            ctx.lineTo(x, y);

            // Move plane
            if (plane && i === points.length - 1) {
                plane.style.left = x + "px";
                plane.style.top = y + "px";
                plane.style.transform = `rotate(${p * 5}deg)`;
            }
        });

        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 🔁 GAME LOOP
    setInterval(() => {

        if (!gameRunning) return;

        currentMultiplier += 0.02;

        document.getElementById("multiplier").innerText =
            currentMultiplier.toFixed(2) + "x";

        points.push(currentMultiplier);
        if (points.length > 150) points.shift();

        drawGraph();

        // 💥 CRASH
        if (currentMultiplier >= crashPoint) {
            gameRunning = false;

            document.getElementById("multiplier").innerText = "CRASH 💥";

            // Reset after 2 seconds
            setTimeout(() => {
                startGame();
            }, 2000);
        }

    }, 100);

    // 💰 PLACE BET
    window.placeBet = function () {

        if (!gameRunning || currentMultiplier > 1.05) {
            alert("Betting closed!");
            return;
        }

        let amount = parseFloat(document.getElementById("betAmount").value);

        if (!amount || amount <= 0) {
            alert("Enter valid bet");
            return;
        }

        hasBet = true;

        socket.emit("bet", amount);

        alert("Bet placed: " + amount);
    };

    // 💸 CASH OUT
    window.cashOut = function () {

        if (!hasBet || !gameRunning) {
            alert("No active bet!");
            return;
        }

        let win = (currentMultiplier * parseFloat(document.getElementById("betAmount").value)).toFixed(2);

        socket.emit("cashout", currentMultiplier);

        alert("You cashed out at " + currentMultiplier.toFixed(2) + "x\nWin: " + win + " KES");

        hasBet = false;
    };

    // 🚀 START FIRST ROUND
    startGame();
};