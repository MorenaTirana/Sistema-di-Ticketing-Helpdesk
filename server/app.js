require("dotenv").config();

if (!process.env.SESSION_SECRET) {
    console.error(
        "Errore: la variabile SESSION_SECRET non è definita in .env"
    );
    process.exit(1);
}

const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const ricRoutes = require("./routes/ricRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const boatRoutes = require("./routes/boatRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const documentRoutes = require("./routes/documentRoutes");
const technicalCommunicationRoutes =
    require("./routes/technicalCommunicationRoutes");
const internalRequestRoutes =
    require("./routes/internalRequestRoutes");
const app = express();
const PORT = process.env.PORT || 3002;


app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 2 * 60 * 60 * 1000
        }
    })
);

app.use(express.static(path.join(__dirname, "../client")));
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use(
    "/api/technical-communications",
    technicalCommunicationRoutes
);
app.use(
    "/api/internal-requests",
    internalRequestRoutes
);
app.use("/api/ric", ricRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/boats", boatRoutes);
app.use("/api/operators", operatorRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Risorsa non trovata"
    });
});

app.use((error, req, res, next) => {
    console.error("Errore non gestito:", error);

    res.status(500).json({
        message: "Errore interno del server"
    });
});


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


