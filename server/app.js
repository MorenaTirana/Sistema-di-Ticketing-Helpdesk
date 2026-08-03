const express = require ("express");

const app = express(); 
const PORT = 3002; 

app.get("/", (req, res) => {
    res.send("Sistema di Ticketing / Hepdesk "); 
    });

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost: ${PORT}`); 
    });
