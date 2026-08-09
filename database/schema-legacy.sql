CREATE DATABASE IF NOT EXISTS ticketing_helpdesk
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci; 

USE ticketing_helpdesk; 

CREATE TABLE utenti (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(100) NOT NULL, 
    cognome VARCHAR(100) NOT NULL, 
    email VARCHAR (255) NOT NULL UNIQUE, 
    password_hash VARCHAR(255) NOT NULL, 
    ruolo ENUM('utente', 'operatore') NOT NULL DEFAULT 'utente', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE ticket(
    id INT AUTO_INCREMENT PRIMARY KEY, 
    utente_id INT NOT NULL, 
    titolo VARCHAR(200) NOT NULL, 
    descrizione TEXT NOT NULL, 
    categoria VARCHAR(100) NOT NULL, 
    stato ENUM(
        'aperto', 
        'in_lavorazione', 
        'risolto', 
        'chiuso'
    ) NOT NULL DEFAULT 'aperto', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP, 

    CONSTRAINT fk_ticket_utente
        FOREIGN KEY (utente_id)
        REFERENCES utenti (id)
        ON DELETE CASCADE
); 

CREATE TABLE commenti(
    id INT AUTO_INCREMENT PRIMARY KEY, 
    ticket_id INT NOT NULL, 
    utente_id INT NOT NULL, 
    testo TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_commento_ticket
    FOREIGN KEY (ticket_id)
    REFERENCES ticket (id) 
    ON DELETE CASCADE, 

    CONSTRAINT fk_commento_utente
    FOREIGN KEY (utente_id) 
    REFERENCES utenti (id) 
    ON DELETE CASCADE 
); 

CREATE TABLE notifiche (
    id INT AUTO_INCREMENT PRIMARY KEY,

    utente_id INT NOT NULL,
    ticket_id INT NOT NULL,

    tipo ENUM(
        'commento_operatore',
        'stato_modificato',
        'assegnazione'
    ) NOT NULL,

    messaggio VARCHAR(255) NOT NULL,

    letta BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifica_utente
        FOREIGN KEY (utente_id)
        REFERENCES utenti(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifica_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES ticket(id)
        ON DELETE CASCADE,

    INDEX idx_notifiche_utente (utente_id),
    INDEX idx_notifiche_letta (letta)
);
