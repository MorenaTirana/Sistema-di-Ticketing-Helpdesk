const bcrypt = require("bcryptjs");
const db = require("../db");
const crypto = require("crypto");

async function register(req, res) {
    try {
        const {
            nome,
            cognome,
            email,
            telefono,
            indirizzo_residenza,
            password
        } = req.body;

        if (
            !nome ||
            !cognome ||
            !email ||
            !telefono ||
            !indirizzo_residenza ||
            !password
        ) {
            return res.status(400).json({
                message: "Tutti i campi sono obbligatori"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "La password deve contenere almeno 8 caratteri"
            });
        }

        const emailNormalizzata = email.trim().toLowerCase();
        const telefonoPulito = telefono.trim();
        const indirizzoResidenzaPulito =
            indirizzo_residenza.trim();

        if (
            telefonoPulito.length < 7 ||
            telefonoPulito.length > 30
        ) {
            return res.status(400).json({
                message: "Numero di telefono non valido"
            });
        }

        if (
            indirizzoResidenzaPulito.length < 5 ||
            indirizzoResidenzaPulito.length > 255
        ) {
            return res.status(400).json({
                message: "Indirizzo di residenza non valido"
            });
        }

        const [utentiEsistenti] = await db.execute(
            "SELECT id FROM utenti WHERE email = ? ",
            [emailNormalizzata]
        );
        if (utentiEsistenti.length > 0) {
            return res.status(409).json({
                message: "Esiste già un utente con questa email"
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);

        const [risultato] = await db.execute(
            `INSERT INTO utenti (
                nome,
                cognome,
                email,
                telefono,
                indirizzo_residenza,
                password_hash
             )
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nome.trim(),
                cognome.trim(),
                emailNormalizzata,
                telefonoPulito,
                indirizzoResidenzaPulito,
                passwordHash
            ]
        );

        return res.status(201).json({
            message: "Registrazione completata",
            utente: {
                id: risultato.insertId,
                nome: nome.trim(),
                cognome: cognome.trim(),
                email: emailNormalizzata,
                telefono: telefonoPulito,
                indirizzo_residenza:
                    indirizzoResidenzaPulito,
                ruolo: "utente"
            }
        });
    } catch (error) {
        console.error("Errore durante la registrazione:", error);

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email e password sono obbligatorie"
            });
        }

        const emailNormalizzata = email.trim().toLowerCase();

        const [utenti] = await db.execute(
            `SELECT
                id,
                nome,
                cognome,
                email,
                telefono,
                indirizzo_residenza,
                password_hash,
                ruolo,
                funzione,
                puo_gestire_operatori, 
                attivo
                FROM utenti
                WHERE email = ?`,
            [emailNormalizzata]
        );
        if (utenti.length === 0) {
            return res.status(401).json({
                message: "Email o password non corrette"

            });
        }

        const utente = utenti[0];
        if (!utente.attivo) {
            return res.status(403).json({
                message:
                    "Questo account è stato disattivato"
            });
        }

        const passwordCorretta = await bcrypt.compare(
            password,
            utente.password_hash
        );

        if (!passwordCorretta) {
            return res.status(401).json({
                message: "Email o password non corrette"
            });
        }
        req.session.utente = {
            id: utente.id,
            nome: utente.nome,
            cognome: utente.cognome,
            email: utente.email,
            telefono: utente.telefono,
            indirizzo_residenza:
                utente.indirizzo_residenza,
            ruolo: utente.ruolo,

            puo_gestire_operatori:
                Boolean(
                    utente.puo_gestire_operatori
                ),
            attivo:
                Boolean(utente.attivo)
        };

        return res.status(200).json({
            message: "Accesso effettuato",
            utente: req.session.utente
        });
    } catch (error) {
        console.error("Errore durante il login:", error);

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateProfile(req, res) {
    try {
        const utenteId =
            req.session.utente.id;

        const {
            nome,
            cognome,
            email,
            telefono,
            indirizzo_residenza
        } = req.body;

        if (
            !nome ||
            !cognome ||
            !email ||
            !telefono ||
            !indirizzo_residenza
        ) {
            return res.status(400).json({
                message:
                    "Nome, cognome, email, telefono e indirizzo di residenza sono obbligatori"
            });
        }

        const nomePulito = nome.trim();
        const cognomePulito = cognome.trim();

        const emailNormalizzata =
            email.trim().toLowerCase();

        const telefonoPulito =
            telefono.trim();

        const indirizzoResidenzaPulito =
            indirizzo_residenza.trim();

        if (
            nomePulito.length < 2 ||
            cognomePulito.length < 2
        ) {
            return res.status(400).json({
                message:
                    "Nome e cognome devono contenere almeno 2 caratteri"
            });
        }

        const emailValida =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValida.test(emailNormalizzata)) {
            return res.status(400).json({
                message: "Indirizzo email non valido"
            });
        }

        if (
            telefonoPulito.length < 6 ||
            telefonoPulito.length > 30
        ) {
            return res.status(400).json({
                message: "Numero di telefono non valido"
            });
        }

        if (
            indirizzoResidenzaPulito.length < 5 ||
            indirizzoResidenzaPulito.length > 255
        ) {
            return res.status(400).json({
                message: "Indirizzo di residenza non valido"
            });
        }

        /*
         * L'email deve essere unica, ma ignoriamo
         * quella appartenente all'utente corrente.
         */
        const [emailEsistenti] = await db.execute(
            `SELECT id
             FROM utenti
             WHERE email = ?
               AND id <> ?`,
            [
                emailNormalizzata,
                utenteId
            ]
        );

        if (emailEsistenti.length > 0) {
            return res.status(409).json({
                message:
                    "L'indirizzo email è già utilizzato da un altro account"
            });
        }

        await db.execute(
            `UPDATE utenti
             SET
                nome = ?,
                cognome = ?,
                email = ?,
                telefono = ?,
                indirizzo_residenza = ?
             WHERE id = ?`,
            [
                nomePulito,
                cognomePulito,
                emailNormalizzata,
                telefonoPulito,
                indirizzoResidenzaPulito,
                utenteId
            ]
        );

        req.session.utente = {
            ...req.session.utente,
            nome: nomePulito,
            cognome: cognomePulito,
            email: emailNormalizzata,
            telefono: telefonoPulito,
            indirizzo_residenza:
                indirizzoResidenzaPulito
        };

        return res.status(200).json({
            message: "Profilo aggiornato correttamente",

            utente: req.session.utente
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento del profilo:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function changePassword(req, res) {
    try {
        const utenteId =
            req.session.utente.id;

        const {
            password_attuale,
            nuova_password,
            conferma_password
        } = req.body;

        if (
            !password_attuale ||
            !nuova_password ||
            !conferma_password
        ) {
            return res.status(400).json({
                message:
                    "Compila tutti i campi della password"
            });
        }

        if (nuova_password.length < 8) {
            return res.status(400).json({
                message:
                    "La nuova password deve contenere almeno 8 caratteri"
            });
        }

        if (
            nuova_password !==
            conferma_password
        ) {
            return res.status(400).json({
                message:
                    "La conferma non corrisponde alla nuova password"
            });
        }

        const [utenti] = await db.execute(
            `SELECT password_hash
             FROM utenti
             WHERE id = ?`,
            [utenteId]
        );

        if (utenti.length === 0) {
            return res.status(404).json({
                message: "Utente non trovato"
            });
        }

        const passwordCorretta =
            await bcrypt.compare(
                password_attuale,
                utenti[0].password_hash
            );

        if (!passwordCorretta) {
            return res.status(401).json({
                message:
                    "La password attuale non è corretta"
            });
        }

        const stessaPassword =
            await bcrypt.compare(
                nuova_password,
                utenti[0].password_hash
            );

        if (stessaPassword) {
            return res.status(400).json({
                message:
                    "La nuova password deve essere diversa da quella attuale"
            });
        }

        const nuovoHash =
            await bcrypt.hash(
                nuova_password,
                10
            );

        await db.execute(
            `UPDATE utenti
             SET password_hash = ?
             WHERE id = ?`,
            [
                nuovoHash,
                utenteId
            ]
        );

        return res.status(200).json({
            message:
                "Password modificata correttamente"
        });
    } catch (error) {
        console.error(
            "Errore durante il cambio della password:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function getCurrentUser(req, res) {
    try {
        if (!req.session.utente) {
            return res.status(401).json({
                message: "Utente non autenticato"
            });
        }

        const [utenti] = await db.execute(
            `SELECT
        id,
        nome,
        cognome,
        email,
        telefono,
        indirizzo_residenza,
        ruolo,
        funzione, 
        puo_gestire_operatori,
        attivo
     FROM utenti
     WHERE id = ?`,
            [req.session.utente.id]
        );

        if (utenti.length === 0) {
            return req.session.destroy(() => {
                res.clearCookie("connect.sid");

                return res.status(401).json({
                    message: "Utente non trovato"
                });
            });
        }

        req.session.utente = {
            ...utenti[0],

            puo_gestire_operatori:
                Boolean(
                    utenti[0].puo_gestire_operatori
                )
        };

        return res.status(200).json({
            utente: req.session.utente
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero dell'utente:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

function logout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Impossibilie terminare la sessione"
            });
        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
            message: "Logout effettuato"
        });
    });
}

async function requestPasswordReset(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message:
                    "Inserisci l'indirizzo email"
            });
        }

        const emailNormalizzata =
            email.trim().toLowerCase();

        const [utenti] = await db.execute(
            `SELECT
                id,
                nome,
                email
             FROM utenti
             WHERE email = ?`,
            [emailNormalizzata]
        );

        /*
         * La risposta rimane uguale anche se l'email
         * non esiste, per non rivelare gli account
         * registrati nel sistema.
         */
        if (utenti.length === 0) {
            return res.status(200).json({
                message:
                    "Se l'indirizzo è registrato, riceverai le istruzioni per reimpostare la password."
            });
        }

        const utente = utenti[0];

        const token =
            crypto.randomBytes(32).toString("hex");

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        /*
         * Rendiamo inutilizzabili eventuali richieste
         * precedenti ancora aperte.
         */
        await db.execute(
            `UPDATE password_reset_tokens
             SET utilizzato = 1
             WHERE utente_id = ?
               AND utilizzato = 0`,
            [utente.id]
        );

        await db.execute(
            `INSERT INTO password_reset_tokens (
                utente_id,
                token_hash,
                scade_il
             )
             VALUES (
                ?,
                ?,
                DATE_ADD(NOW(), INTERVAL 30 MINUTE)
             )`,
            [
                utente.id,
                tokenHash
            ]
        );

        const appUrl =
            process.env.APP_URL ||
            "http://localhost:3002";

        const resetLink =
            `${appUrl}/reset-password.html?token=${token}`;

        /*
         * Modalità di sviluppo:
         * il link viene mostrato solamente nel terminale.
         * In produzione sarà inviato tramite email.
         */
        console.log(
            `Link recupero password per ${utente.email}:`
        );

        console.log(resetLink);

        return res.status(200).json({
            message:
                "Se l'indirizzo è registrato, riceverai le istruzioni per reimpostare la password."
        });
    } catch (error) {
        console.error(
            "Errore durante la richiesta di recupero password:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function resetPassword(req, res) {
    let connection;

    try {
        const {
            token,
            nuova_password,
            conferma_password
        } = req.body;

        if (
            !token ||
            !nuova_password ||
            !conferma_password
        ) {
            return res.status(400).json({
                message:
                    "Token e nuova password sono obbligatori"
            });
        }

        if (nuova_password.length < 8) {
            return res.status(400).json({
                message:
                    "La nuova password deve contenere almeno 8 caratteri"
            });
        }

        if (
            nuova_password !==
            conferma_password
        ) {
            return res.status(400).json({
                message:
                    "Le password inserite non corrispondono"
            });
        }

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [tokens] =
            await connection.execute(
                `SELECT
                    id,
                    utente_id
                 FROM password_reset_tokens
                 WHERE token_hash = ?
                   AND utilizzato = 0
                   AND scade_il > NOW()
                 FOR UPDATE`,
                [tokenHash]
            );

        if (tokens.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message:
                    "Il link non è valido oppure è scaduto"
            });
        }

        const resetToken = tokens[0];

        const nuovoHash =
            await bcrypt.hash(
                nuova_password,
                10
            );

        await connection.execute(
            `UPDATE utenti
             SET password_hash = ?
             WHERE id = ?`,
            [
                nuovoHash,
                resetToken.utente_id
            ]
        );

        /*
         * Tutti i token dell'utente diventano inutilizzabili.
         */
        await connection.execute(
            `UPDATE password_reset_tokens
             SET utilizzato = 1
             WHERE utente_id = ?`,
            [resetToken.utente_id]
        );

        await connection.commit();

        return res.status(200).json({
            message:
                "Password reimpostata correttamente. Ora puoi accedere."
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Errore durante la reimpostazione della password:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    logout,
};