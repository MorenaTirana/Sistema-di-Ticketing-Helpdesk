const db = require("../db");

function requireAuth(req, res, next) {
    if (!req.session.utente) {
        return res.status(401).json({
            message: "Autenticazione richiesta"
        });
    }

    next();
}

function requireOperator(req, res, next) {
    if (!req.session.utente) {
        return res.status(401).json({
            message: "Autenticazione richiesta"
        });
    }

    if (
        req.session.utente.ruolo !== "operatore"
    ) {
        return res.status(403).json({
            message:
                "Operazione riservata agli operatori After Sales"
        });
    }

    next();
}

/*
 * Consente l’accesso agli operatori After Sales
 * e ai tecnici che ricevono una consultazione.
 */
function requireOperatorOrTechnician(
    req,
    res,
    next
) {
    if (!req.session.utente) {
        return res.status(401).json({
            message: "Autenticazione richiesta"
        });
    }

    const ruolo =
        req.session.utente.ruolo;

    const ruoloConsentito =
        ruolo === "operatore" ||
        ruolo === "tecnico";

    if (!ruoloConsentito) {
        return res.status(403).json({
            message:
                "Operazione riservata agli operatori e ai tecnici"
        });
    }

    next();
}

async function requireOperatorManager(
    req,
    res,
    next
) {
    try {
        if (!req.session.utente) {
            return res.status(401).json({
                message:
                    "Autenticazione richiesta"
            });
        }

        if (
            req.session.utente.ruolo !==
            "operatore"
        ) {
            return res.status(403).json({
                message:
                    "Operazione riservata agli operatori After Sales"
            });
        }

        const [operatori] =
            await db.execute(
                `SELECT
                    id,
                    ruolo,
                    puo_gestire_operatori
                 FROM utenti
                 WHERE id = ?`,
                [req.session.utente.id]
            );

        if (operatori.length === 0) {
            return res.status(401).json({
                message:
                    "Operatore non trovato"
            });
        }

        const operatore =
            operatori[0];

        if (
            !operatore.puo_gestire_operatori
        ) {
            return res.status(403).json({
                message:
                    "Non sei autorizzato a gestire gli operatori"
            });
        }

        req.session.utente
            .puo_gestire_operatori = true;

        next();
    } catch (error) {
        console.error(
            "Errore verifica gestione operatori:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}

module.exports = {
    requireAuth,
    requireOperator,
    requireOperatorOrTechnician,
    requireOperatorManager
};