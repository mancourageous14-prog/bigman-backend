const express = require("express");
const db = require("./db");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.get( "/", (req, res) => {
    res.send("Bigman Portfolio Backend is working!");
});

app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required." });
    }

    try {
        await db.execute(
            "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
            [name.trim(), email.trim(), message.trim()]
        );

        res.status(201).json({ message: "Your message was sent successfully." });
    } catch (error) {
        console.error("Unable to save contact message:", error);
        res.status(500).json({ message: "Unable to send your message right now." });
    }
});

app.listen(3000, async () => {
    try {
        await db.query("SELECT 1");
        console.log("Connected to bigman_portfolio database!");
    } catch (error) {
        console.error("Database connection failed:", error);
    }

    console.log("Server is running on port 3000");
});
