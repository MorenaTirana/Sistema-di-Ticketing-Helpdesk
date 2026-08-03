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
module.exports = {register}; 