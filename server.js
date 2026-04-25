const express = require("express");
const app = express();

// ✅ Serve frontend files
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("CASHIN running on port " + PORT);
});