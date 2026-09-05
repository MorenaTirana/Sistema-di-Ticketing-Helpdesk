const db = require("../db");

async function getArticles(req, res) {
    try {
        const utente = req.session.utente;

        const soloPubblicati =
            utente.ruolo !== "operatore";

        const query = soloPubblicati
            ? `SELECT
                id, titolo, categoria, contenuto,
                pubblicato, created_at, updated_at
             FROM articoli_knowledge_base
             WHERE pubblicato = 1
             ORDER BY updated_at DESC`
            : `SELECT
                id, titolo, categoria, contenuto,
                pubblicato, created_at, updated_at
             FROM articoli_knowledge_base
             ORDER BY updated_at DESC`;

        const [articoli] = await db.execute(query);

        return res.status(200).json({ articoli });
    } catch (error) {
        console.error(
            "Errore durante il recupero degli articoli:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function getArticleById(req, res) {
    try {
        const articleId = Number(req.params.id);
        const utente = req.session.utente;

        if (!Number.isInteger(articleId) || articleId <= 0) {
            return res.status(400).json({
                message: "Identificativo dell'articolo non valido"
            });
        }

        const [articoli] = await db.execute(
            `SELECT
                id, titolo, categoria, contenuto,
                pubblicato, created_at, updated_at
             FROM articoli_knowledge_base
             WHERE id = ?`,
            [articleId]
        );

        if (articoli.length === 0) {
            return res.status(404).json({
                message: "Articolo non trovato"
            });
        }

        const articolo = articoli[0];

        if (
            !articolo.pubblicato &&
            utente.ruolo !== "operatore"
        ) {
            return res.status(404).json({
                message: "Articolo non trovato"
            });
        }

        return res.status(200).json({ articolo });
    } catch (error) {
        console.error(
            "Errore durante il recupero dell'articolo:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

function validateArticleInput(body) {
    const titolo =
        typeof body.titolo === "string"
            ? body.titolo.trim()
            : "";

    const contenuto =
        typeof body.contenuto === "string"
            ? body.contenuto.trim()
            : "";

    const categoria =
        typeof body.categoria === "string" &&
        body.categoria.trim().length > 0
            ? body.categoria.trim()
            : null;

    if (titolo.length < 5 || titolo.length > 200) {
        return {
            valid: false,
            message:
                "Il titolo deve contenere tra 5 e 200 caratteri"
        };
    }

    if (contenuto.length < 10) {
        return {
            valid: false,
            message:
                "Il contenuto deve contenere almeno 10 caratteri"
        };
    }

    return {
        valid: true,
        titolo,
        contenuto,
        categoria
    };
}

async function createArticle(req, res) {
    try {
        const utente = req.session.utente;

        const validazione = validateArticleInput(req.body);

        if (!validazione.valid) {
            return res.status(400).json({
                message: validazione.message
            });
        }

        const pubblicato =
            req.body.pubblicato === false ? 0 : 1;

        const [risultato] = await db.execute(
            `INSERT INTO articoli_knowledge_base (
                titolo, categoria, contenuto, pubblicato, creato_da
             )
             VALUES (?, ?, ?, ?, ?)`,
            [
                validazione.titolo,
                validazione.categoria,
                validazione.contenuto,
                pubblicato,
                utente.id
            ]
        );

        return res.status(201).json({
            message: "Articolo creato correttamente",
            articolo: {
                id: risultato.insertId,
                titolo: validazione.titolo,
                categoria: validazione.categoria,
                contenuto: validazione.contenuto,
                pubblicato
            }
        });
    } catch (error) {
        console.error(
            "Errore durante la creazione dell'articolo:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateArticle(req, res) {
    try {
        const articleId = Number(req.params.id);

        if (!Number.isInteger(articleId) || articleId <= 0) {
            return res.status(400).json({
                message: "Identificativo dell'articolo non valido"
            });
        }

        const validazione = validateArticleInput(req.body);

        if (!validazione.valid) {
            return res.status(400).json({
                message: validazione.message
            });
        }

        const pubblicato =
            req.body.pubblicato === false ? 0 : 1;

        const [risultato] = await db.execute(
            `UPDATE articoli_knowledge_base
             SET titolo = ?, categoria = ?, contenuto = ?, pubblicato = ?
             WHERE id = ?`,
            [
                validazione.titolo,
                validazione.categoria,
                validazione.contenuto,
                pubblicato,
                articleId
            ]
        );

        if (risultato.affectedRows === 0) {
            return res.status(404).json({
                message: "Articolo non trovato"
            });
        }

        return res.status(200).json({
            message: "Articolo aggiornato correttamente"
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento dell'articolo:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function deleteArticle(req, res) {
    try {
        const articleId = Number(req.params.id);

        if (!Number.isInteger(articleId) || articleId <= 0) {
            return res.status(400).json({
                message: "Identificativo dell'articolo non valido"
            });
        }

        const [risultato] = await db.execute(
            `DELETE FROM articoli_knowledge_base WHERE id = ?`,
            [articleId]
        );

        if (risultato.affectedRows === 0) {
            return res.status(404).json({
                message: "Articolo non trovato"
            });
        }

        return res.status(200).json({
            message: "Articolo eliminato correttamente"
        });
    } catch (error) {
        console.error(
            "Errore durante l'eliminazione dell'articolo:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
};
