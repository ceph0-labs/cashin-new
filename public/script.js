const socket = io();

let currentMultiplier = 2;
let points = [];
let gameRunning = true;
let crashPoint = 0;
let hasBet = false;
let bettingOpen = true;

// Wait for DOM
window.onload = () => {

    const canvas = document.getElementById("graph");
    const ctx = canvas.getContext("2d");
    const plane = document.getElementById("plane");

    canvas.width = 800;
    canvas.height = 300;

    // 🎮 START GAME WITH 5s BETTING WINDOW
    function startGame() {

        gameRunning = false;
        bettingOpen = true;
        hasBet = false;

        let countdown = 5;

        document.getElementById("multiplier").innerText = "BETTING OPENS";

        const interval = setInterval(() => {

            document.getElementById("multiplier").innerText =
                "Starting in " + countdown + "...";

            countdown--;

            if (countdown < 0) {
                clearInterval(interval);

                // 🚀 START ROUND
                bettingOpen = false;
                gameRunning = true;

                currentMultiplier = 2;
                points = [];

                crashPoint = parseFloat((Math.random() * 3.5 + 1.5).toFixed(2));

                console.log("Crash at:", crashPoint);

                // Reset plane position
                if (plane) {
                    plane.style.left = "0px";
                    plane.style.top = "260px";
                    plane.style.transform = "rotate(20deg)";
                }
            }

        }, 1000);
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
        ctx.lineWidth = 1;
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

            // Restart after 2 seconds → goes back to betting phase
            setTimeout(() => {
                startGame();
            }, 2000);
        }

    }, 100);

    // 💰 PLACE BET
    window.placeBet = function () {

        if (!bettingOpen) {
            alert("Betting is closed!");
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

        let betAmount = parseFloat(document.getElementById("betAmount").value);
        let win = (currentMultiplier * betAmount).toFixed(2);

        socket.emit("cashout", currentMultiplier);

        alert(
            "Cashed out at " +
            currentMultiplier.toFixed(2) +
            "x\nWin: " +
            win +
            " KES"
        );

        hasBet = false;
    };

    // 🚀 START FIRST ROUND
    startGame();
};
