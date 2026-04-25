const express = require("express");
const app = express();

// ✅ Serve frontend files
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

// Multiplayer storage
let players = {};

// Socket connection
io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join", (username) => {
        players[socket.id] = {
            username: username,
            bet: 0,
            cashedOut: false
        };

        io.emit("players", Object.values(players));
    });

    socket.on("bet", (amount) => {
        if (!players[socket.id]) return;

        if (amount < 100) {
            socket.emit("error", "Minimum bet is 100 KES");
            return;
        }

        players[socket.id].bet = amount;
        players[socket.id].cashedOut = false;

        io.emit("players", Object.values(players));
    });

    socket.on("cashout", (multiplier) => {
        if (!players[socket.id]) return;
        if (players[socket.id].cashedOut) return;

        let win = players[socket.id].bet * multiplier;

        players[socket.id].cashedOut = true;

        socket.emit("cashed", win.toFixed(2));

        io.emit("playerCashout", {
            username: players[socket.id].username,
            amount: win.toFixed(2)
        });

    socket.on("playerCashout", (data) => {
    console.log(data.username + " cashed out " + data.amount);
});

    socket.on("players", (players) => {
    const list = document.getElementById("playersList");

    if (!list) return;

    list.innerHTML = "";

    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player.username + " - Bet: " + player.bet;
        list.appendChild(li);
    });
});
    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("players", Object.values(players));
    });
});

// IMPORTANT: use server.listen instead of app.listen
server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});