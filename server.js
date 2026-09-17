const express = require("express");
const db = require("./db");
const app = express();
const port = Number(process.env.PORT || 3000);

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
    res.json({ message: "Bigman Portfolio Backend is working!" });
});

app.post("/api/contact", async (req, res) => {
    const body = req.body || {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (name.length > 100 || email.length > 255 || message.length > 5000) {
        return res.status(400).json({ message: "Your message is too long." });
    }

    try {
        await db.execute(
            "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
            [name, email, message]
        );

        res.status(201).json({ message: "Your message was sent successfully." });
    } catch (error) {
        console.error("Unable to save contact message:", error);
        res.status(500).json({ message: "Unable to send your message right now." });
    }
});

async function initializeDatabase() {
    try {
        await db.query("SELECT 1");
        await db.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log("Connected to bigman_portfolio database!");
        console.log("contact_messages table is ready.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    initializeDatabase();
});
