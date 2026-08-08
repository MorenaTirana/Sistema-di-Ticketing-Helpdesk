require("dotenv").config();

const express = require ("express");
const session = require("express-session");
const path = require ("path");
const db = require("./db");
const authRoutes = require("./routes/authRoutes"); 
const ticketRoutes = require("./routes/ticketRoutes");
const ricRoutes = require("./routes/ricRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const boatRoutes = require("./routes/boatRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
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
app.use("/api/tickets", ticketRoutes);
app.use("/api/ric", ricRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/boats", boatRoutes);
app.use("/api/operators", operatorRoutes);


async function startServer() {
    try {
        const connection = await db.getConnection();

        const [databaseResult] = await connection.query(
            "SELECT DATABASE() AS database_attivo"
        );

        const [colonneTicket] = await connection.query(
            "SHOW COLUMNS FROM ticket"
        );
        console.log(
            "Database utilizzato:",
            databaseResult[0].database_attivo
        );
        console.log(
            "Colonne della tabella ticket:",
            colonneTicket.map((colonna) => colonna.Field).join(", ")
        ); 

        console.log("Connessione a MySQL riuscita.");
        connection.release();
        app.listen(PORT, () => {
            console.log(`Server avviato su http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Errore durante la connessione a MySQL:", error.message);
    }
}

startServer();


