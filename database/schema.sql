-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ago 09, 2026 alle 05:33
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

CREATE DATABASE IF NOT EXISTS ticketing_helpdesk
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ticketing_helpdesk;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ticketing_helpdesk`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `analisi_ai_specialisti`
--

CREATE TABLE `analisi_ai_specialisti` (
  `analisi_id` int(11) NOT NULL,
  `specializzazione_id` int(11) NOT NULL,
  `tipo_suggerimento` enum('principale','supporto') NOT NULL,
  `attendibilita` decimal(5,2) DEFAULT NULL,
  `motivazione` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `analisi_ai_ticket`
--

CREATE TABLE `analisi_ai_ticket` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `ticket_voce_id` int(11) NOT NULL,
  `stato` enum('in_attesa','in_analisi','completata','errore','revisionata') NOT NULL DEFAULT 'in_attesa',
  `modello_ai` varchar(100) DEFAULT NULL,
  `versione_prompt` varchar(50) DEFAULT NULL,
  `riepilogo` text DEFAULT NULL,
  `problema_ipotizzato` text DEFAULT NULL,
  `categoria_suggerita_id` int(11) DEFAULT NULL,
  `priorita_suggerita` enum('bassa','media','alta','urgente') DEFAULT NULL,
  `rischio_sicurezza` tinyint(1) NOT NULL DEFAULT 0,
  `descrizione_rischio` text DEFAULT NULL,
  `attendibilita` decimal(5,2) DEFAULT NULL,
  `informazioni_mancanti` text DEFAULT NULL,
  `motivazione_ai` text DEFAULT NULL,
  `esito_revisione` enum('in_attesa','confermato','corretto','rifiutato') NOT NULL DEFAULT 'in_attesa',
  `condivisa_tecnici` tinyint(1) NOT NULL DEFAULT 0,
  `condivisa_da` int(11) DEFAULT NULL,
  `condivisa_at` datetime DEFAULT NULL,
  `correzione_operatore` text DEFAULT NULL,
  `revisionata_da` int(11) DEFAULT NULL,
  `revisionata_at` datetime DEFAULT NULL,
  `errore_analisi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `assegnazioni_tecniche`
--

CREATE TABLE `assegnazioni_tecniche` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `assegnato_a` int(11) NOT NULL,
  `assegnato_da` int(11) NOT NULL,
  `richiesta_valutazione` text NOT NULL,
  `valutazione_origine_id` int(11) DEFAULT NULL,
  `mostra_valutazione_origine` tinyint(1) NOT NULL DEFAULT 0,
  `stato` enum('assegnata','in_valutazione','valutata','chiusa') NOT NULL DEFAULT 'assegnata',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `valutata_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `barche`
--

CREATE TABLE `barche` (
  `id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `modello` varchar(100) NOT NULL,
  `matricola` varchar(100) NOT NULL,
  `anno_produzione` year(4) NOT NULL,
  `localizzazione` varchar(255) NOT NULL,
  `indirizzo_consegna` varchar(255) NOT NULL,
  `garanzia_attivata_il` date DEFAULT NULL,
  `garanzia_scadenza_il` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `categorie_componenti`
--

CREATE TABLE `categorie_componenti` (
  `id` int(11) NOT NULL,
  `codice` varchar(50) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descrizione` varchar(500) DEFAULT NULL,
  `attiva` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `categorie_specializzazioni`
--

CREATE TABLE `categorie_specializzazioni` (
  `categoria_id` int(11) NOT NULL,
  `specializzazione_id` int(11) NOT NULL,
  `tipo_competenza` enum('principale','supporto') NOT NULL DEFAULT 'principale'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `commenti`
--

CREATE TABLE `commenti` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `testo` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `comunicazioni_tecniche_cliente`
--

CREATE TABLE `comunicazioni_tecniche_cliente` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `valutazione_origine_id` int(11) DEFAULT NULL,
  `operatore_id` int(11) NOT NULL,
  `titolo` varchar(200) NOT NULL,
  `messaggio` text NOT NULL,
  `stato` enum('bozza','inviata') NOT NULL DEFAULT 'bozza',
  `inviata_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `documenti_ticket`
--

CREATE TABLE `documenti_ticket` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `ric_id` int(11) DEFAULT NULL,
  `tipo` enum('preventivo','proforma','ordine_fornitore','ddt_fornitore','ddt_cliente','documento_corriere','conferma_pagamento','altro') NOT NULL,
  `numero_documento` varchar(100) DEFAULT NULL,
  `serie_documento` varchar(20) DEFAULT NULL,
  `data_documento` date DEFAULT NULL,
  `note` text DEFAULT NULL,
  `visibile_cliente` tinyint(1) NOT NULL DEFAULT 0,
  `nome_file_originale` varchar(255) NOT NULL,
  `nome_file_salvato` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `dimensione_file` int(10) UNSIGNED NOT NULL,
  `caricato_da` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `escalation_pratiche`
--

CREATE TABLE `escalation_pratiche` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `tipo` enum('eccezione_commerciale','rischio_legale','rischio_sicurezza','rischio_reputazionale','impatto_economico','cliente_strategico','altro') NOT NULL,
  `destinatario` enum('commerciale','ceo') NOT NULL,
  `richiesta_da` int(11) NOT NULL,
  `assegnata_a` int(11) DEFAULT NULL,
  `motivo` text NOT NULL,
  `stato` enum('aperta','in_valutazione','richiesta_informazioni','approvata','rifiutata','chiusa') NOT NULL DEFAULT 'aperta',
  `decisione` text DEFAULT NULL,
  `copertura_concessa` enum('nessuna','totale','parziale') DEFAULT NULL,
  `percentuale_copertura` decimal(5,2) DEFAULT NULL,
  `visibile_cliente` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `decisione_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `notifiche`
--

CREATE TABLE `notifiche` (
  `id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `tipo` enum('commento_operatore','stato_modificato','assegnazione','gestione_aggiornata','workflow_avanzato','nuova_pratica','assegnazione_tecnica','valutazione_tecnica','comunicazione_cliente','spedizione_aggiornata','escalation','allarme_cliente') NOT NULL,
  `messaggio` varchar(255) NOT NULL,
  `letta` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `pratiche_ricambi`
--

CREATE TABLE `pratiche_ricambi` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `numero_ric` varchar(50) DEFAULT NULL,
  `stato_pratica` enum('richiesta_ricevuta','preventivo_in_preparazione','attesa_approvazione','approvata','proforma_emessa','attesa_pagamento','pagata','ordine_fornitore','merce_disponibile','spedita','completata','annullata') NOT NULL DEFAULT 'richiesta_ricevuta',
  `estimated_lead_time` varchar(150) DEFAULT NULL,
  `shipping_fees` decimal(10,2) DEFAULT NULL,
  `pagamento_confermato_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ric`
--

CREATE TABLE `ric` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `barca_id` int(11) NOT NULL,
  `numero_ric` varchar(50) NOT NULL,
  `causale` enum('garanzia','trasferta','ricambio','altro') NOT NULL,
  `destinatario` varchar(255) NOT NULL,
  `riferimento` varchar(255) NOT NULL,
  `data_ric` date NOT NULL,
  `note` text DEFAULT NULL,
  `visibile_cliente` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `nome_file_originale` varchar(255) DEFAULT NULL,
  `nome_file_salvato` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `dimensione_file` int(10) UNSIGNED DEFAULT NULL,
  `caricato_da` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ric_righe`
--

CREATE TABLE `ric_righe` (
  `id` int(11) NOT NULL,
  `ric_id` int(11) NOT NULL,
  `codice_articolo` varchar(50) DEFAULT NULL,
  `descrizione` text NOT NULL,
  `unita_misura` varchar(10) DEFAULT NULL,
  `quantita` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `specializzazioni`
--

CREATE TABLE `specializzazioni` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `storico_stati`
--

CREATE TABLE `storico_stati` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `operatore_id` int(11) DEFAULT NULL,
  `stato_precedente` enum('aperto','in_lavorazione','risolto','chiuso') NOT NULL,
  `stato_nuovo` enum('aperto','in_lavorazione','risolto','chiuso') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `storico_workflow`
--

CREATE TABLE `storico_workflow` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `fase_precedente` varchar(50) DEFAULT NULL,
  `fase_nuova` varchar(50) NOT NULL,
  `descrizione` varchar(500) NOT NULL,
  `visibile_cliente` tinyint(1) NOT NULL DEFAULT 1,
  `modificato_da` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ticket`
--

CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `barca_id` int(11) DEFAULT NULL,
  `operatore_id` int(11) DEFAULT NULL,
  `titolo` varchar(200) NOT NULL,
  `descrizione` text NOT NULL,
  `localizzazione_richiesta` varchar(255) DEFAULT NULL,
  `indirizzo_consegna_richiesta` varchar(255) DEFAULT NULL,
  `contatto_bordo` varchar(30) DEFAULT NULL,
  `categoria` varchar(100) NOT NULL,
  `tipo_richiesta` enum('garanzia','ricambi','servizio') DEFAULT NULL,
  `copertura` enum('da_valutare','in_garanzia','fuori_garanzia') NOT NULL DEFAULT 'da_valutare',
  `costo` decimal(10,2) DEFAULT NULL,
  `stato` enum('aperto','in_lavorazione','risolto','chiuso') NOT NULL DEFAULT 'aperto',
  `priorita` enum('bassa','media','alta','urgente') NOT NULL DEFAULT 'media',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ticket_allegati`
--

CREATE TABLE `ticket_allegati` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `ticket_voce_id` int(11) NOT NULL,
  `tipo` enum('foto','video') NOT NULL,
  `descrizione` varchar(500) NOT NULL,
  `nome_file_originale` varchar(255) NOT NULL,
  `nome_file_salvato` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `dimensione_file` int(10) UNSIGNED NOT NULL,
  `durata_secondi` int(10) UNSIGNED DEFAULT NULL,
  `nome_anteprima` varchar(255) DEFAULT NULL,
  `caricato_da` int(11) NOT NULL,
  `visibile_cliente` tinyint(1) NOT NULL DEFAULT 1,
  `consenso_analisi_ai` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ticket_voci`
--

CREATE TABLE `ticket_voci` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `categoria_componente_id` int(11) NOT NULL,
  `numero_voce` int(11) NOT NULL,
  `tipo_voce` enum('problema_tecnico','ricambio_richiesto','servizio_richiesto') NOT NULL,
  `parte_interessata` varchar(255) NOT NULL,
  `codice_articolo` varchar(100) DEFAULT NULL,
  `numero_seriale_etichetta` varchar(150) DEFAULT NULL,
  `descrizione_materiale` text DEFAULT NULL,
  `descrizione_problema` text NOT NULL,
  `servizio_richiesto` text NOT NULL,
  `quantita` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `ruolo` enum('utente','operatore','tecnico','ufficio_tecnico','capo_produzione','ingegnere','commerciale','contabile','ceo','amministrazione') NOT NULL DEFAULT 'utente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti_specializzazioni`
--

CREATE TABLE `utenti_specializzazioni` (
  `utente_id` int(11) NOT NULL,
  `specializzazione_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `valutazioni_tecniche`
--

CREATE TABLE `valutazioni_tecniche` (
  `id` int(11) NOT NULL,
  `assegnazione_id` int(11) NOT NULL,
  `autore_id` int(11) NOT NULL,
  `esito` enum('soluzione_tecnica','richiesta_informazioni','sostituzione_necessaria','riparazione_locale','trasferta_necessaria','danno_cliente','fuori_garanzia','non_riparabile','altro') NOT NULL,
  `diagnosi` text NOT NULL,
  `soluzione_proposta` text NOT NULL,
  `codice_articolo_suggerito` varchar(100) DEFAULT NULL,
  `descrizione_articolo_suggerito` text DEFAULT NULL,
  `stato` enum('bozza','inviata_operatore','approvata_operatore','inviata_cliente','respinta_operatore') NOT NULL DEFAULT 'bozza',
  `note_interne` text DEFAULT NULL,
  `approvata_da` int(11) DEFAULT NULL,
  `approvata_at` datetime DEFAULT NULL,
  `inviata_cliente_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `workflow_pratiche`
--

CREATE TABLE `workflow_pratiche` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `fase` enum('inviata','letta','in_lavorazione','attesa_dati_cliente','diagnosi_tecnica','intervento_programmato','intervento_eseguito','preventivo_in_preparazione','preventivo_inviato','preventivo_approvato','garanzia_approvata','prf_caricata','attesa_pagamento','pagamento_confermato','ric_caricato','verifica_magazzino','disponibile_magazzino','ordine_fornitore','merce_arrivata','ddt_caricato','spedizione_prenotata','spedita','consegnata','completata','annullata') NOT NULL DEFAULT 'inviata',
  `disponibilita_magazzino` enum('da_verificare','disponibile','non_disponibile','ordinata','ricevuta') NOT NULL DEFAULT 'da_verificare',
  `aggiornato_da` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `analisi_ai_specialisti`
--
ALTER TABLE `analisi_ai_specialisti`
  ADD PRIMARY KEY (`analisi_id`,`specializzazione_id`),
  ADD KEY `fk_ai_specialista_tipo` (`specializzazione_id`);

--
-- Indici per le tabelle `analisi_ai_ticket`
--
ALTER TABLE `analisi_ai_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_analisi_ticket` (`ticket_id`),
  ADD KEY `fk_analisi_voce` (`ticket_voce_id`),
  ADD KEY `fk_analisi_categoria` (`categoria_suggerita_id`),
  ADD KEY `fk_analisi_revisore` (`revisionata_da`),
  ADD KEY `fk_analisi_condivisione` (`condivisa_da`);

--
-- Indici per le tabelle `assegnazioni_tecniche`
--
ALTER TABLE `assegnazioni_tecniche`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ticket_specialista` (`ticket_id`,`assegnato_a`),
  ADD KEY `fk_assegnazione_destinatario` (`assegnato_a`),
  ADD KEY `fk_assegnazione_autore` (`assegnato_da`),
  ADD KEY `fk_assegnazione_valutazione_origine` (`valutazione_origine_id`);

--
-- Indici per le tabelle `barche`
--
ALTER TABLE `barche`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matricola` (`matricola`),
  ADD KEY `idx_barche_utente` (`utente_id`),
  ADD KEY `idx_barche_modello` (`modello`),
  ADD KEY `idx_barche_matricola` (`matricola`);

--
-- Indici per le tabelle `categorie_componenti`
--
ALTER TABLE `categorie_componenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice` (`codice`);

--
-- Indici per le tabelle `categorie_specializzazioni`
--
ALTER TABLE `categorie_specializzazioni`
  ADD PRIMARY KEY (`categoria_id`,`specializzazione_id`),
  ADD KEY `fk_specializzazione_categoria` (`specializzazione_id`);

--
-- Indici per le tabelle `commenti`
--
ALTER TABLE `commenti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_commento_ticket` (`ticket_id`),
  ADD KEY `fk_commento_utente` (`utente_id`);

--
-- Indici per le tabelle `comunicazioni_tecniche_cliente`
--
ALTER TABLE `comunicazioni_tecniche_cliente`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_comunicazione_ticket` (`ticket_id`),
  ADD KEY `fk_comunicazione_valutazione` (`valutazione_origine_id`),
  ADD KEY `fk_comunicazione_operatore` (`operatore_id`);

--
-- Indici per le tabelle `documenti_ticket`
--
ALTER TABLE `documenti_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_documento_ticket` (`ticket_id`),
  ADD KEY `fk_documento_ric` (`ric_id`),
  ADD KEY `fk_documento_operatore` (`caricato_da`);

--
-- Indici per le tabelle `escalation_pratiche`
--
ALTER TABLE `escalation_pratiche`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_escalation_ticket` (`ticket_id`),
  ADD KEY `fk_escalation_richiedente` (`richiesta_da`),
  ADD KEY `fk_escalation_assegnatario` (`assegnata_a`);

--
-- Indici per le tabelle `notifiche`
--
ALTER TABLE `notifiche`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifica_ticket` (`ticket_id`),
  ADD KEY `idx_notifiche_utente` (`utente_id`),
  ADD KEY `idx_notifiche_letta` (`letta`);

--
-- Indici per le tabelle `pratiche_ricambi`
--
ALTER TABLE `pratiche_ricambi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_id` (`ticket_id`);

--
-- Indici per le tabelle `ric`
--
ALTER TABLE `ric`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_ric` (`numero_ric`),
  ADD KEY `fk_ric_ticket` (`ticket_id`),
  ADD KEY `fk_ric_barca` (`barca_id`),
  ADD KEY `fk_ric_operatore` (`caricato_da`);

--
-- Indici per le tabelle `ric_righe`
--
ALTER TABLE `ric_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_riga_ric` (`ric_id`);

--
-- Indici per le tabelle `specializzazioni`
--
ALTER TABLE `specializzazioni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- Indici per le tabelle `storico_stati`
--
ALTER TABLE `storico_stati`
  ADD PRIMARY KEY (`id`),
  ADD KEY `operatore_id` (`operatore_id`),
  ADD KEY `idx_storico_ticket` (`ticket_id`),
  ADD KEY `idx_storico_data` (`created_at`);

--
-- Indici per le tabelle `storico_workflow`
--
ALTER TABLE `storico_workflow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_storico_workflow_ticket` (`ticket_id`),
  ADD KEY `fk_storico_workflow_utente` (`modificato_da`);

--
-- Indici per le tabelle `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ticket_utente` (`utente_id`),
  ADD KEY `idx_ticket_barca` (`barca_id`),
  ADD KEY `idx_ticket_tipo_richiesta` (`tipo_richiesta`),
  ADD KEY `idx_ticket_copertura` (`copertura`),
  ADD KEY `idx_ticket_priorita` (`priorita`),
  ADD KEY `idx_ticket_operatore` (`operatore_id`);

--
-- Indici per le tabelle `ticket_allegati`
--
ALTER TABLE `ticket_allegati`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome_file_salvato` (`nome_file_salvato`),
  ADD KEY `fk_allegato_ticket` (`ticket_id`),
  ADD KEY `fk_allegato_voce` (`ticket_voce_id`),
  ADD KEY `fk_allegato_autore` (`caricato_da`);

--
-- Indici per le tabelle `ticket_voci`
--
ALTER TABLE `ticket_voci`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ticket_numero_voce` (`ticket_id`,`numero_voce`),
  ADD KEY `fk_voce_categoria` (`categoria_componente_id`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indici per le tabelle `utenti_specializzazioni`
--
ALTER TABLE `utenti_specializzazioni`
  ADD PRIMARY KEY (`utente_id`,`specializzazione_id`),
  ADD KEY `fk_specializzazione_tipo` (`specializzazione_id`);

--
-- Indici per le tabelle `valutazioni_tecniche`
--
ALTER TABLE `valutazioni_tecniche`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_valutazione_assegnazione` (`assegnazione_id`),
  ADD KEY `fk_valutazione_autore` (`autore_id`),
  ADD KEY `fk_valutazione_approvatore` (`approvata_da`);

--
-- Indici per le tabelle `workflow_pratiche`
--
ALTER TABLE `workflow_pratiche`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_id` (`ticket_id`),
  ADD KEY `fk_workflow_operatore` (`aggiornato_da`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `analisi_ai_ticket`
--
ALTER TABLE `analisi_ai_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `assegnazioni_tecniche`
--
ALTER TABLE `assegnazioni_tecniche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `barche`
--
ALTER TABLE `barche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `categorie_componenti`
--
ALTER TABLE `categorie_componenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `commenti`
--
ALTER TABLE `commenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `comunicazioni_tecniche_cliente`
--
ALTER TABLE `comunicazioni_tecniche_cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `documenti_ticket`
--
ALTER TABLE `documenti_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `escalation_pratiche`
--
ALTER TABLE `escalation_pratiche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `notifiche`
--
ALTER TABLE `notifiche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `pratiche_ricambi`
--
ALTER TABLE `pratiche_ricambi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ric`
--
ALTER TABLE `ric`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ric_righe`
--
ALTER TABLE `ric_righe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `specializzazioni`
--
ALTER TABLE `specializzazioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `storico_stati`
--
ALTER TABLE `storico_stati`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `storico_workflow`
--
ALTER TABLE `storico_workflow`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ticket_allegati`
--
ALTER TABLE `ticket_allegati`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ticket_voci`
--
ALTER TABLE `ticket_voci`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `valutazioni_tecniche`
--
ALTER TABLE `valutazioni_tecniche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `workflow_pratiche`
--
ALTER TABLE `workflow_pratiche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `analisi_ai_specialisti`
--
ALTER TABLE `analisi_ai_specialisti`
  ADD CONSTRAINT `fk_ai_specialista_analisi` FOREIGN KEY (`analisi_id`) REFERENCES `analisi_ai_ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ai_specialista_tipo` FOREIGN KEY (`specializzazione_id`) REFERENCES `specializzazioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `analisi_ai_ticket`
--
ALTER TABLE `analisi_ai_ticket`
  ADD CONSTRAINT `fk_analisi_categoria` FOREIGN KEY (`categoria_suggerita_id`) REFERENCES `categorie_componenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_analisi_condivisione` FOREIGN KEY (`condivisa_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_analisi_revisore` FOREIGN KEY (`revisionata_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_analisi_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_analisi_voce` FOREIGN KEY (`ticket_voce_id`) REFERENCES `ticket_voci` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `assegnazioni_tecniche`
--
ALTER TABLE `assegnazioni_tecniche`
  ADD CONSTRAINT `fk_assegnazione_autore` FOREIGN KEY (`assegnato_da`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_assegnazione_destinatario` FOREIGN KEY (`assegnato_a`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assegnazione_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assegnazione_valutazione_origine` FOREIGN KEY (`valutazione_origine_id`) REFERENCES `valutazioni_tecniche` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `barche`
--
ALTER TABLE `barche`
  ADD CONSTRAINT `fk_barche_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `categorie_specializzazioni`
--
ALTER TABLE `categorie_specializzazioni`
  ADD CONSTRAINT `fk_categoria_specializzazione` FOREIGN KEY (`categoria_id`) REFERENCES `categorie_componenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_specializzazione_categoria` FOREIGN KEY (`specializzazione_id`) REFERENCES `specializzazioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `commenti`
--
ALTER TABLE `commenti`
  ADD CONSTRAINT `fk_commento_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_commento_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `comunicazioni_tecniche_cliente`
--
ALTER TABLE `comunicazioni_tecniche_cliente`
  ADD CONSTRAINT `fk_comunicazione_operatore` FOREIGN KEY (`operatore_id`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_comunicazione_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comunicazione_valutazione` FOREIGN KEY (`valutazione_origine_id`) REFERENCES `valutazioni_tecniche` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `documenti_ticket`
--
ALTER TABLE `documenti_ticket`
  ADD CONSTRAINT `fk_documento_operatore` FOREIGN KEY (`caricato_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documento_ric` FOREIGN KEY (`ric_id`) REFERENCES `ric` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documento_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `escalation_pratiche`
--
ALTER TABLE `escalation_pratiche`
  ADD CONSTRAINT `fk_escalation_assegnatario` FOREIGN KEY (`assegnata_a`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_escalation_richiedente` FOREIGN KEY (`richiesta_da`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_escalation_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `notifiche`
--
ALTER TABLE `notifiche`
  ADD CONSTRAINT `fk_notifica_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notifica_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `pratiche_ricambi`
--
ALTER TABLE `pratiche_ricambi`
  ADD CONSTRAINT `fk_pratica_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ric`
--
ALTER TABLE `ric`
  ADD CONSTRAINT `fk_ric_barca` FOREIGN KEY (`barca_id`) REFERENCES `barche` (`id`),
  ADD CONSTRAINT `fk_ric_operatore` FOREIGN KEY (`caricato_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ric_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ric_righe`
--
ALTER TABLE `ric_righe`
  ADD CONSTRAINT `fk_riga_ric` FOREIGN KEY (`ric_id`) REFERENCES `ric` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `storico_stati`
--
ALTER TABLE `storico_stati`
  ADD CONSTRAINT `storico_stati_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `storico_stati_ibfk_2` FOREIGN KEY (`operatore_id`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `storico_workflow`
--
ALTER TABLE `storico_workflow`
  ADD CONSTRAINT `fk_storico_workflow_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_storico_workflow_utente` FOREIGN KEY (`modificato_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `fk_ticket_barca` FOREIGN KEY (`barca_id`) REFERENCES `barche` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ticket_operatore` FOREIGN KEY (`operatore_id`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ticket_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ticket_allegati`
--
ALTER TABLE `ticket_allegati`
  ADD CONSTRAINT `fk_allegato_autore` FOREIGN KEY (`caricato_da`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_allegato_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_allegato_voce` FOREIGN KEY (`ticket_voce_id`) REFERENCES `ticket_voci` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ticket_voci`
--
ALTER TABLE `ticket_voci`
  ADD CONSTRAINT `fk_voce_categoria` FOREIGN KEY (`categoria_componente_id`) REFERENCES `categorie_componenti` (`id`),
  ADD CONSTRAINT `fk_voce_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `utenti_specializzazioni`
--
ALTER TABLE `utenti_specializzazioni`
  ADD CONSTRAINT `fk_specializzazione_tipo` FOREIGN KEY (`specializzazione_id`) REFERENCES `specializzazioni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_specializzazione_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `valutazioni_tecniche`
--
ALTER TABLE `valutazioni_tecniche`
  ADD CONSTRAINT `fk_valutazione_approvatore` FOREIGN KEY (`approvata_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_valutazione_assegnazione` FOREIGN KEY (`assegnazione_id`) REFERENCES `assegnazioni_tecniche` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_valutazione_autore` FOREIGN KEY (`autore_id`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `workflow_pratiche`
--
ALTER TABLE `workflow_pratiche`
  ADD CONSTRAINT `fk_workflow_operatore` FOREIGN KEY (`aggiornato_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_workflow_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
