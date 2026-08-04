const bcrypt = require("bcryptjs"); 
const db = require ("../db"); 

async function register(req, res) {
    try{
        const {nome, cognome, email, password} = req.body; 

        if(!nome || !cognome || !email || !password) {
            return res.status(400).json({
                message: "Tutti i campi sono obbligatori"
                });
}
            if(password.length < 8 ) {
                return res.status(400).json({
                    message: "La password deve contenere almeno 8 caratteri"
                });
            }

            const emailNormalizzata = email.trim().toLowerCase(); 

            const [utentiEsistenti] = await db.execute(
                "SELECT id FROM utenti WHERE email = ? ", 
                [emailNormalizzata]
            );
            if(utentiEsistenti.length > 0) {
                return res.status(409).json({
                    message: "Esiste già un utente con questa email"
                });
              }
              const passwordHash = await bcrypt.hash(password, 10); 
              
              const[risultato] = await db.execute(
                `INSERT INTO utenti 
                (nome, cognome, email, password_hash)
                VALUES (?, ?, ?, ? )`, 
                [nome.trim(),
                    cognome.trim(), 
                    emailNormalizzata, 
                    passwordHash
                ]
              ); 
              return res.status(201).json({
                message:"Registrazione completata", 
                utente: {
                    id: risultato.insertId, 
                    nome: nome.trim(), 
                    cognome: cognome.trim(), 
                    email: emailNormalizzata, 
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
    try 
{
    const {email, password} = req.body; 

    if(!email || !password) {
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
            password_hash,
            ruolo
            FROM utenti
            WHERE email = ? `,
            [emailNormalizzata]
        ); 

        if(utenti.length === 0) {
            return res.status(401).json( {
                message:"Email o password non corrette"

             });
        }

        const utente = utenti[0];

        const passwordCorretta = await bcrypt.compare(
            password, 
            utente.password_hash
        );

        if(!passwordCorretta) {
            return res.status(401).json( {
                message: "Email o password non corrette"
              });
        }

        req.session.utente = {
            id: utente.id,
            nome: utente.nome, 
            cognome: utente.cognome, 
            email: utente.email, 
            ruolo: utente.ruolo
            };

            return res.status(200).json ({
                message:"Accesso effettuato",
                utente:req.session.utente
             });
    } catch(error){
        console.error("Errore durante il login:", error);

        return res.status(500).json({
            message: "Errore interno del server"
           });
    }
}

function getCurrentUser(req, res)  {
    if(!req.session.utente) {
        return res.status(401).json( {
            message:"Utente non autenticato"
            });
    }

    return res.status(200).json({
        utente: req.session.utente
     });
}

function logout(req, res) {
    req.session.destroy((error) => {
        if(error) {
            return res.status(500).json({
                message:"Impossibilie terminare la sessione"
             });
        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
            message:"Logout effettuato"
             });
    });
}

module.exports = {
    register,
    login, 
    getCurrentUser,
    logout
}; 
