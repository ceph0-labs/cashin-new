const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);

// ✅ FIXED SOCKET CONFIG FOR RENDER
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static("public"));
app.use(bodyParser.json());

app.use(session({
    secret: "cashin-secret",
    resave: false,
    saveUninitialized: true
}));

// 🧠 Fake DB
let users = {};

// 🎮 ROUND STATE
let currentRound = {
    players: {},
    multiplier: 1,
    crashPoint: 1,
    running: false
};

function generateCrash() {
    return (1 / (1 - Math.random())).toFixed(2);
}

// 🔐 AUTH
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (users[username]) return res.json({ error: "User exists" });

    users[username] = {
        password,
        balance: 1000
    };

    res.json({ success: true });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!users[username] || users[username].password !== password) {
        return res.json({ error: "Invalid login" });
    }

    req.session.user = username;
    res.json({ success: true });
});

app.get("/balance", (req, res) => {
    const user = users[req.session.user];
    res.json({ balance: user?.balance || 0 });
});

// 💰 BET
app.post("/bet", (req, res) => {
    const user = users[req.session.user];
    const { amount } = req.body;

    if (!user) return res.json({ error: "Login first" });
    if (currentRound.running) return res.json({ error: "Round already started" });
    if (user.balance < amount) return res.json({ error: "Insufficient balance" });

    user.balance -= amount;

    currentRound.players[req.session.user] = {
        bet: Number(amount),
        cashedOut: false
    };

    res.json({ success: true });
});

// 🎮 GAME LOOP
function startRound() {
    currentRound.multiplier = 1;
    currentRound.crashPoint = generateCrash();
    currentRound.running = true;

    io.emit("roundStart");

    let start = Date.now();

    const interval = setInterval(() => {
        let t = (Date.now() - start) / 1000;
        currentRound.multiplier = Math.exp(0.1 * t);

        io.emit("multiplier", currentRound.multiplier.toFixed(2));

        if (currentRound.multiplier >= currentRound.crashPoint) {
            io.emit("crash", currentRound.crashPoint);

            currentRound.running = false;
            currentRound.players = {};

            clearInterval(interval);
            setTimeout(startRound, 4000);
        }
    }, 100);
}

// 👥 SOCKET
io.on("connection", (socket) => {

    socket.on("join", (username) => {
        socket.username = username;
    });

    socket.on("cashout", () => {
        const username = socket.username;
        const player = currentRound.players[username];
        const user = users[username];

        if (!player || player.cashedOut || !currentRound.running) return;

        const win = player.bet * currentRound.multiplier;

        user.balance += win;
        player.cashedOut = true;

        socket.emit("cashed", win.toFixed(2));

        io.emit("playerCashout", {
            username,
            amount: win.toFixed(2)
        });
    });
});

// ✅ IMPORTANT: RENDER PORT FIX
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("CASHIN running on port " + PORT);
    startRound();
});