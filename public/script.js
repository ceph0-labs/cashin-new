const socket = io();

let currentMultiplier = 1;
let points = [];

// Wait for DOM
window.onload = () => {

    const canvas = document.getElementById("graph");
    const ctx = canvas.getContext("2d");
    const plane = document.getElementById("plane");

    canvas.width = 800;
    canvas.height = 300;

    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        points.forEach((p, i) => {
            let x = i * 5;
            let y = canvas.height - p * 20;

            ctx.lineTo(x, y);

            // Move plane safely
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

    // GAME LOOP (THIS WAS BREAKING)
    setInterval(() => {
        currentMultiplier += 0.02;

        document.getElementById("multiplier").innerText =
            currentMultiplier.toFixed(2) + "x";

        points.push(currentMultiplier);

        if (points.length > 150) points.shift();

        drawGraph();
    }, 100);

};