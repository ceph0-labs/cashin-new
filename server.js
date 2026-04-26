const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ Serve frontend
app.use(express.static("public"));

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
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("players", Object.values(players));
    });

});

// ✅ Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});