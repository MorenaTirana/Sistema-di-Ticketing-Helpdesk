function requireAuth(req, res, next) {
    if(!req.session.utente) {
        return res.status(401).json({
            message: "Autenticazione richiesta"
            });
    }
    next(); 
    }

    function requireOperator( req, res, next)  {
        if(!req.session.utente) {
            return res.status(401).json( {
                message:"Autenticazione richiesta"
              });
    }

    if(req.session.utente.ruolo !== "operatore") {
        return res.status(403).json( {
            message: "Operazione riservata agli operatori"
           });
    }
    next(); 
    }
    module.exports = {
        requireAuth, 
        requireOperator
        };