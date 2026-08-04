require("dotenv").config();


const express = require ("express");
const session = require("express-session");
const path = require ("path");

const db = require("./db");
const authRoutes = require("./routes/authRoutes"); 

const app = express(); 
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use(
    session({
        secret:process.env.SESSION_SECRET,
        resave:false, 
        saveUninitialized: false, 
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure:false,
            maxAge: 2 * 60 * 60 * 1000
        }
    })
);

app.use(express.static(path.join(__dirname, "../client")));

app.use("/api/auth", authRoutes);

async function startServer() {
    try {
        const connection = await db.getConnection();
        console.log("Connessione a MySQL riuscita.");
        connection.release();
        app.listen(PORT, () => {
            console.log(`Server avviato su http://localhost: ${PORT}`);
        });
    } catch (error) {
        console.error("Errore durante la connessione a MySQL:", error.message);
    }
}

startServer();


