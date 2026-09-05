-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 05, 2026 alle 10:23
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET FOREIGN_KEY_CHECKS=0;
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
-- Struttura della tabella `allegati_consultazioni`
--

DROP TABLE IF EXISTS `allegati_consultazioni`;
CREATE TABLE `allegati_consultazioni` (
  `id` int(11) NOT NULL,
  `consultazione_id` int(11) NOT NULL,
  `risposta_id` int(11) DEFAULT NULL,
  `caricato_da` int(11) NOT NULL,
  `nome_originale` varchar(255) NOT NULL,
  `nome_file` varchar(255) NOT NULL,
  `mime_type` varchar(150) NOT NULL,
  `dimensione` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `allegati_consultazioni`
--

INSERT INTO `allegati_consultazioni` (`id`, `consultazione_id`, `risposta_id`, `caricato_da`, `nome_originale`, `nome_file`, `mime_type`, `dimensione`, `created_at`) VALUES
(1, 2, 1, 9, 'schema elettrico.jpg', '1786494766941-d52d988a-05f1-42ed-9ea4-0c2c13cabe3b.jpg', 'image/jpeg', 114146, '2026-08-12 00:32:46');

-- --------------------------------------------------------

--
-- Struttura della tabella `analisi_ai_specialisti`
--

DROP TABLE IF EXISTS `analisi_ai_specialisti`;
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

DROP TABLE IF EXISTS `analisi_ai_ticket`;
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
-- Struttura della tabella `articoli_commerciali_ticket`
--

DROP TABLE IF EXISTS `articoli_commerciali_ticket`;
CREATE TABLE `articoli_commerciali_ticket` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `codice_articolo` varchar(100) NOT NULL,
  `descrizione_articolo` varchar(500) NOT NULL,
  `costo_articolo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `quantita` int(11) NOT NULL DEFAULT 1,
  `estimated_lead_time` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `assegnazioni_tecniche`
--

DROP TABLE IF EXISTS `assegnazioni_tecniche`;
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

DROP TABLE IF EXISTS `barche`;
CREATE TABLE `barche` (
  `id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `modello` varchar(100) NOT NULL,
  `matricola` varchar(100) NOT NULL,
  `anno_produzione` year(4) NOT NULL,
  `localizzazione` varchar(255) NOT NULL,
  `indirizzo_consegna` varchar(255) DEFAULT NULL,
  `garanzia_attivata_il` date DEFAULT NULL,
  `garanzia_scadenza_il` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `barche`
--

INSERT INTO `barche` (`id`, `utente_id`, `modello`, `matricola`, `anno_produzione`, `localizzazione`, `indirizzo_consegna`, `garanzia_attivata_il`, `garanzia_scadenza_il`, `created_at`) VALUES
(1, 4, 'KL27 EFB 017', 'IT-SES329024D132', '2025', 'Porto di Genova', 'Via del Porto 10, Genova', '2025-09-10', '2027-09-10', '2026-08-06 20:35:35'),
(2, 4, 'C38 054', 'IT-SEI 231054G123', '2024', 'CODIGORO', 'Porto Marina, 17\n24058 Codigoro (FE)\nItalia', '2024-02-12', '2026-02-12', '2026-08-09 11:03:08'),
(3, 1, 'C44 042', 'IT-SEI 623042H421', '2025', 'CHIOGGIA', 'VIA GARIBALBI 123, CHIOGGIA , 31056', '2025-05-03', '2027-05-03', '2026-08-09 11:26:52'),
(4, 2, 'C3X FB 011', 'IT-SES 425011K101', '1999', 'PALERMO', 'VIA MAZZONI 16/F, 52012, PALERM', NULL, NULL, '2026-08-09 18:26:12'),
(5, 2, 'OYSTER 19', 'IT-SES 25621J123', '2001', 'VENEZIA', 'VIA PAPA LEONE 13, 45201, VENEZIA', NULL, NULL, '2026-08-09 19:00:55'),
(6, 1, 'ISLAMORADA 27', 'IT-SES 124052D4785', '2010', 'LAVAGNA', 'VIA MATTEOTTI 26, 41254 LAVAGNA', NULL, NULL, '2026-08-09 19:11:46'),
(7, 5, 'F47 012', 'IT-SES 4512012H145', '2015', 'PUGLIA', 'VIA FRANCESCO CRISPI 1, 45124 PUGLIA', NULL, NULL, '2026-08-09 19:38:33'),
(8, 5, 'KL34 015', 'IT-SES 234015T124', '2016', 'Porto di Genova', 'Via del Porto 10, Genova', NULL, NULL, '2026-08-09 20:12:31'),
(9, 5, 'C5X EFB 010', 'IT-SES 23568I102', '2018', 'PORTO DI GENOVA', 'MARINA DI GENOVA 12, 26045 GENOVA', NULL, NULL, '2026-08-10 14:34:25'),
(10, 4, 'F42', 'IT-SEI329024H112', '2013', 'Marina di Varazze', 'Via Papa Giovanni XXIII', NULL, NULL, '2026-09-04 20:28:10');

-- --------------------------------------------------------

--
-- Struttura della tabella `categorie_componenti`
--

DROP TABLE IF EXISTS `categorie_componenti`;
CREATE TABLE `categorie_componenti` (
  `id` int(11) NOT NULL,
  `codice` varchar(50) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descrizione` varchar(500) DEFAULT NULL,
  `attiva` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `categorie_componenti`
--

INSERT INTO `categorie_componenti` (`id`, `codice`, `nome`, `descrizione`, `attiva`) VALUES
(1, 'motore_propulsione', 'Motore e propulsione', 'Motore, trasmissione, invertitore, assi ed eliche', 1),
(2, 'generatore', 'Generatore', 'Generatore, avviamento e alimentazione', 1),
(3, 'impianto_elettrico', 'Impianto elettrico', 'Batterie, quadri, cablaggi, luci, caricabatterie e inverter', 1),
(4, 'elettronica_navigazione', 'Elettronica di navigazione', 'GPS, radar, VHF, autopilota, sensori e display', 1),
(5, 'impianto_idraulico', 'Impianto idraulico', 'Pompe, autoclave, serbatoi, WC, scarichi e sentine', 1),
(6, 'climatizzazione', 'Climatizzazione e refrigerazione', 'Aria condizionata, frigoriferi e sistemi di raffreddamento', 1),
(7, 'timoneria_movimentazione', 'Timoneria e movimentazioni', 'Timoneria, flap, passerelle, piattaforme e stabilizzatori', 1),
(8, 'scafo_struttura', 'Scafo e struttura', 'Scafo, crepe, infiltrazioni, vetroresina e compositi', 1),
(9, 'gelcoat_verniciatura', 'Gelcoat e verniciatura', 'Gelcoat, vernice e finiture esterne', 1),
(10, 'interni_falegnameria', 'Interni e falegnameria', 'Mobili, porte, pannelli, pavimenti e teak', 1),
(11, 'tappezzeria_tendalini', 'Tappezzeria e tendalini', 'Cuscini, rivestimenti, tendalini e coperture', 1),
(12, 'vetri_serramenti', 'Vetri e serramenti', 'Parabrezza, finestrature, oblò e porte', 1),
(13, 'coperta_acciaio', 'Coperta e acciaio', 'Bitte, tientibene, acciaio inox, ancora e verricello', 1),
(14, 'elettrodomestici', 'Elettrodomestici', 'Piano cottura, cucina e apparecchiature di bordo', 1),
(15, 'disegni_codici', 'Disegni e codici articolo', 'Identificazione parti, tavole, disegni e revisioni', 1),
(16, 'altro', 'Altro o componente non identificato', 'Parte o sistema non ancora identificato', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `categorie_specializzazioni`
--

DROP TABLE IF EXISTS `categorie_specializzazioni`;
CREATE TABLE `categorie_specializzazioni` (
  `categoria_id` int(11) NOT NULL,
  `specializzazione_id` int(11) NOT NULL,
  `tipo_competenza` enum('principale','supporto') NOT NULL DEFAULT 'principale'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `categorie_specializzazioni`
--

INSERT INTO `categorie_specializzazioni` (`categoria_id`, `specializzazione_id`, `tipo_competenza`) VALUES
(1, 2, 'principale'),
(2, 1, 'supporto'),
(2, 2, 'principale'),
(3, 1, 'principale'),
(5, 1, 'supporto'),
(5, 4, 'principale'),
(7, 1, 'supporto'),
(8, 6, 'principale'),
(8, 7, 'supporto'),
(8, 8, 'supporto'),
(9, 3, 'principale'),
(10, 5, 'principale'),
(12, 6, 'supporto'),
(14, 1, 'principale'),
(16, 7, 'principale'),
(16, 8, 'principale');

-- --------------------------------------------------------

--
-- Struttura della tabella `commenti`
--

DROP TABLE IF EXISTS `commenti`;
CREATE TABLE `commenti` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `testo` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `commenti`
--

INSERT INTO `commenti` (`id`, `ticket_id`, `utente_id`, `testo`, `created_at`, `updated_at`) VALUES
(2, 3, 3, 'Le mandiamo uno nuovo in garanzia', '2026-08-05 22:13:39', NULL),
(3, 4, 3, 'Costa 300 €, viene consegnato in 2 giorni . Shipping fee = 50 €', '2026-08-05 22:31:32', NULL),
(4, 10, 5, 'Salve, voglio un riscontro.', '2026-08-11 02:49:18', NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `comunicazioni_tecniche_cliente`
--

DROP TABLE IF EXISTS `comunicazioni_tecniche_cliente`;
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

--
-- Dump dei dati per la tabella `comunicazioni_tecniche_cliente`
--

INSERT INTO `comunicazioni_tecniche_cliente` (`id`, `ticket_id`, `valutazione_origine_id`, `operatore_id`, `titolo`, `messaggio`, `stato`, `inviata_at`, `created_at`) VALUES
(1, 5, NULL, 3, 'Aggiornamento tecnico della pratica', 'La richiesta � stata esaminata e si trova attualmente in valutazione tecnica.', 'inviata', '2026-08-09 04:55:46', '2026-08-09 02:54:58');

-- --------------------------------------------------------

--
-- Struttura della tabella `consultazioni_ticket`
--

DROP TABLE IF EXISTS `consultazioni_ticket`;
CREATE TABLE `consultazioni_ticket` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `richiesta_da` int(11) NOT NULL,
  `consulente_id` int(11) NOT NULL,
  `richiesta` text NOT NULL,
  `risposta` text DEFAULT NULL,
  `stato` enum('richiesta','risposta_ricevuta','completata') NOT NULL DEFAULT 'richiesta',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `consultazioni_ticket`
--

INSERT INTO `consultazioni_ticket` (`id`, `ticket_id`, `richiesta_da`, `consulente_id`, `richiesta`, `risposta`, `stato`, `created_at`, `updated_at`) VALUES
(2, 6, 3, 9, 'Ciao Giovanni, potresti valutare questo problema per favore? Attendo tuo riscontro per procedere.', 'verificare batterie, morsetti, masse, fusibili, relè e serraggio dei collegamenti elettrici. Individuare eventuali contatti allentati, ossidati o surriscaldati mediante misurazione della tensione e test di continuità; ripristinare o sostituire i componenti difettosi. i componenti più sospetti sono:\r\n\r\nInterruttore magnetotermico/portafusibile difettoso.\r\nRelè di potenza con contatti usurati.\r\nStaccabatteria con contatto interno intermittente.\r\nMorsetto o capocorda allentato, ossidato o surriscaldato.\r\nIn ultimo, batteria con elemento interno danneggiato.\r\n\r\nPrima della sostituzione, un elettricista nautico deve effettuare una prova di caduta di tensione sotto carico. Il componente che presenta una caduta anomala va sostituito.', 'risposta_ricevuta', '2026-08-11 15:01:17', '2026-08-12 00:32:46');

-- --------------------------------------------------------

--
-- Struttura della tabella `documenti_ticket`
--

DROP TABLE IF EXISTS `documenti_ticket`;
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

--
-- Dump dei dati per la tabella `documenti_ticket`
--

INSERT INTO `documenti_ticket` (`id`, `ticket_id`, `ric_id`, `tipo`, `numero_documento`, `serie_documento`, `data_documento`, `note`, `visibile_cliente`, `nome_file_originale`, `nome_file_salvato`, `mime_type`, `dimensione_file`, `caricato_da`, `created_at`) VALUES
(1, 5, 2, 'proforma', 'TEST-PRF-2867', 'PRF', '2026-08-09', 'Prova caricamento documento visibile al cliente', 1, 'PRF 2867 - Coppia CILINDRI - C44 039.pdf', '1786231836511-d6c672b4-480a-4e64-a270-088ce92ed4e0.pdf', 'application/pdf', 103421, 3, '2026-08-08 23:30:36');

-- --------------------------------------------------------

--
-- Struttura della tabella `escalation_pratiche`
--

DROP TABLE IF EXISTS `escalation_pratiche`;
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

DROP TABLE IF EXISTS `notifiche`;
CREATE TABLE `notifiche` (
  `id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `messaggio` varchar(255) NOT NULL,
  `letta` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `notifiche`
--

INSERT INTO `notifiche` (`id`, `utente_id`, `ticket_id`, `tipo`, `messaggio`, `letta`, `created_at`) VALUES
(2, 4, 3, 'commento_operatore', 'L\'operatore MORENA TIRANA ha aggiunto un commento al ticket #3.', 0, '2026-08-05 22:13:39'),
(3, 4, 4, 'commento_operatore', 'L\'operatore MORENA TIRANA ha aggiunto un commento al ticket #4.', 0, '2026-08-05 22:31:32'),
(4, 4, 5, 'gestione_aggiornata', 'Il ticket #5 è stato aggiornato: copertura \"Da valutare\", costo 547.00 euro.', 0, '2026-08-06 22:10:19'),
(5, 4, 5, 'gestione_aggiornata', 'Il ticket #5 è stato aggiornato: copertura \"Fuori garanzia\", costo 547.00 euro.', 0, '2026-08-06 22:12:56'),
(6, 4, 5, 'gestione_aggiornata', 'Il ticket #5 è stato aggiornato: priorità \"Urgente\", copertura \"Fuori garanzia\", costo 547.00 euro.', 0, '2026-08-08 07:29:48'),
(7, 4, 5, 'assegnazione', 'Il ticket #5 è stato assegnato all\'operatore MORENA TIRANA.', 0, '2026-08-08 19:57:11'),
(8, 4, 5, 'stato_modificato', 'Lo stato del ticket #5 è stato modificato in \"In lavorazione\".', 0, '2026-08-08 20:53:46'),
(9, 4, 5, 'stato_modificato', 'Lo stato del ticket #5 è stato modificato in \"Risolto\".', 0, '2026-08-08 21:00:22'),
(10, 4, 5, 'stato_modificato', 'Lo stato del ticket #5 è stato modificato in \"Chiuso\".', 0, '2026-08-08 21:19:56'),
(11, 4, 5, 'comunicazione_cliente', 'Hai ricevuto una nuova comunicazione relativa al ticket #5.', 0, '2026-08-09 02:55:46'),
(12, 1, 6, 'nuova_pratica', 'È stata registrata la pratica #6 per la tua richiesta di assistenza.', 0, '2026-08-09 11:28:53'),
(13, 5, 13, 'stato_modificato', 'Lo stato del ticket #13 è stato modificato in \"In lavorazione\".', 0, '2026-08-10 18:44:47'),
(14, 4, 3, 'assegnazione', 'Il ticket #3 è stato assegnato all\'operatore Lorenzo Vezzoli.', 0, '2026-08-10 20:44:39'),
(15, 4, 4, 'stato_modificato', 'Lo stato del ticket #4 è stato modificato in \"In lavorazione\".', 0, '2026-08-11 11:13:30'),
(16, 4, 4, 'assegnazione', 'Il ticket #4 è stato assegnato all\'operatore Lorenzo Vezzoli.', 0, '2026-08-11 11:13:32'),
(17, 4, 4, 'assegnazione', 'Il ticket #4 è stato assegnato all\'operatore Filippo Parietti.', 0, '2026-08-11 11:22:57'),
(18, 1, 6, 'stato_modificato', 'Lo stato del ticket #6 è stato modificato in \"In lavorazione\".', 0, '2026-08-11 12:12:18'),
(19, 3, 6, 'risposta_consultazione', 'Giovanni Ferrari ha risposto alla consultazione del ticket #6.', 0, '2026-08-12 00:32:46');

-- --------------------------------------------------------

--
-- Struttura della tabella `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `scade_il` datetime NOT NULL,
  `utilizzato` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `utente_id`, `token_hash`, `scade_il`, `utilizzato`, `created_at`) VALUES
(1, 4, '9edc2a20bdf43e8ce51d6cee53158bc9530f2639080fb9b5e395f041b3b8307f', '2026-08-09 18:43:44', 1, '2026-08-09 16:13:44'),
(2, 2, 'b9755307faef4ff14e523d4c49e51df0c6ea3b9e47691fbf42da4eb07871c478', '2026-08-09 20:24:04', 1, '2026-08-09 17:54:04'),
(3, 2, '6d5de4a3cc77a1d647811e2ff659b9fb92517b74ce8fd3d78bf0a2934668b929', '2026-08-09 20:33:15', 0, '2026-08-09 18:03:15'),
(4, 4, 'bbce8e683d3a17a6b7dea8c605e507618d875adf58ab3cd9bf4ca6ef0c1fe64f', '2026-09-04 22:42:24', 1, '2026-09-04 20:12:24');

-- --------------------------------------------------------

--
-- Struttura della tabella `pratiche_ricambi`
--

DROP TABLE IF EXISTS `pratiche_ricambi`;
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

DROP TABLE IF EXISTS `ric`;
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

--
-- Dump dei dati per la tabella `ric`
--

INSERT INTO `ric` (`id`, `ticket_id`, `barca_id`, `numero_ric`, `causale`, `destinatario`, `riferimento`, `data_ric`, `note`, `visibile_cliente`, `created_at`, `nome_file_originale`, `nome_file_salvato`, `mime_type`, `dimensione_file`, `caricato_da`) VALUES
(1, 5, 1, 'TEST-001', 'ricambio', 'Cliente di prova', 'Ricambio per la barca del ticket', '2026-08-09', 'Prova dell\'API RIC', 0, '2026-08-08 22:12:23', NULL, NULL, NULL, NULL, NULL),
(2, 5, 1, '1432', 'trasferta', 'Mario Rossi', 'Ric. KL27 EFB 017', '2026-08-09', 'Garanzia C44 042', 0, '2026-08-08 22:40:41', 'RIC 1432 - Materiali TRASFERTA 23_07 - Post Trasferta.pdf', '1786228841032-c227710a-66b8-4e42-a492-2a3c33165fac.pdf', 'application/pdf', 183377, 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `richieste_interne_ticket`
--

DROP TABLE IF EXISTS `richieste_interne_ticket`;
CREATE TABLE `richieste_interne_ticket` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `richiesto_da` int(11) NOT NULL,
  `assegnato_a` int(11) NOT NULL,
  `richiesta` text NOT NULL,
  `stato` enum('in_attesa','risposta_ricevuta','completata') NOT NULL DEFAULT 'in_attesa',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ric_righe`
--

DROP TABLE IF EXISTS `ric_righe`;
CREATE TABLE `ric_righe` (
  `id` int(11) NOT NULL,
  `ric_id` int(11) NOT NULL,
  `codice_articolo` varchar(50) DEFAULT NULL,
  `descrizione` text NOT NULL,
  `unita_misura` varchar(10) DEFAULT NULL,
  `quantita` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `ric_righe`
--

INSERT INTO `ric_righe` (`id`, `ric_id`, `codice_articolo`, `descrizione`, `unita_misura`, `quantita`) VALUES
(1, 1, 'ART-001', 'Materiale di prova', 'NR', 2.00);

-- --------------------------------------------------------

--
-- Struttura della tabella `risposte_consultazioni`
--

DROP TABLE IF EXISTS `risposte_consultazioni`;
CREATE TABLE `risposte_consultazioni` (
  `id` int(11) NOT NULL,
  `consultazione_id` int(11) NOT NULL,
  `autore_id` int(11) NOT NULL,
  `testo` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `risposte_consultazioni`
--

INSERT INTO `risposte_consultazioni` (`id`, `consultazione_id`, `autore_id`, `testo`, `created_at`, `updated_at`) VALUES
(1, 2, 9, 'verificare batterie, morsetti, masse, fusibili, relè e serraggio dei collegamenti elettrici. Individuare eventuali contatti allentati, ossidati o surriscaldati mediante misurazione della tensione e test di continuità; ripristinare o sostituire i componenti difettosi. i componenti più sospetti sono:\r\n\r\nInterruttore magnetotermico/portafusibile difettoso.\r\nRelè di potenza con contatti usurati.\r\nStaccabatteria con contatto interno intermittente.\r\nMorsetto o capocorda allentato, ossidato o surriscaldato.\r\nIn ultimo, batteria con elemento interno danneggiato.\r\n\r\nPrima della sostituzione, un elettricista nautico deve effettuare una prova di caduta di tensione sotto carico. Il componente che presenta una caduta anomala va sostituito.', '2026-08-12 00:32:46', '2026-08-12 00:32:46');

-- --------------------------------------------------------

--
-- Struttura della tabella `risposte_interne_ticket`
--

DROP TABLE IF EXISTS `risposte_interne_ticket`;
CREATE TABLE `risposte_interne_ticket` (
  `id` int(11) NOT NULL,
  `richiesta_interna_id` int(11) NOT NULL,
  `autore_id` int(11) NOT NULL,
  `testo` text DEFAULT NULL,
  `nome_file_originale` varchar(255) DEFAULT NULL,
  `nome_file_salvato` varchar(255) DEFAULT NULL,
  `mime_type` varchar(150) DEFAULT NULL,
  `dimensione_file` bigint(20) DEFAULT NULL,
  `visibile_cliente` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `specializzazioni`
--

DROP TABLE IF EXISTS `specializzazioni`;
CREATE TABLE `specializzazioni` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `specializzazioni`
--

INSERT INTO `specializzazioni` (`id`, `nome`) VALUES
(8, 'Capo produzione'),
(1, 'Elettricista'),
(5, 'Falegname'),
(4, 'Idraulico nautico'),
(7, 'Ingegnere'),
(2, 'Motorista'),
(6, 'Tecnico compositi e vetroresina'),
(3, 'Verniciatore');

-- --------------------------------------------------------

--
-- Struttura della tabella `storico_stati`
--

DROP TABLE IF EXISTS `storico_stati`;
CREATE TABLE `storico_stati` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `operatore_id` int(11) DEFAULT NULL,
  `stato_precedente` enum('aperto','in_lavorazione','risolto','chiuso') NOT NULL,
  `stato_nuovo` enum('aperto','in_lavorazione','risolto','chiuso') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `storico_stati`
--

INSERT INTO `storico_stati` (`id`, `ticket_id`, `operatore_id`, `stato_precedente`, `stato_nuovo`, `created_at`) VALUES
(1, 5, 3, 'aperto', 'in_lavorazione', '2026-08-08 20:53:46'),
(2, 5, 3, 'in_lavorazione', 'risolto', '2026-08-08 21:00:22'),
(3, 5, 3, 'risolto', 'chiuso', '2026-08-08 21:19:56'),
(4, 13, 3, 'aperto', 'in_lavorazione', '2026-08-10 18:44:47'),
(5, 4, 3, 'aperto', 'in_lavorazione', '2026-08-11 11:13:30'),
(6, 6, 3, 'aperto', 'in_lavorazione', '2026-08-11 12:12:18');

-- --------------------------------------------------------

--
-- Struttura della tabella `storico_workflow`
--

DROP TABLE IF EXISTS `storico_workflow`;
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

--
-- Dump dei dati per la tabella `storico_workflow`
--

INSERT INTO `storico_workflow` (`id`, `ticket_id`, `fase_precedente`, `fase_nuova`, `descrizione`, `visibile_cliente`, `modificato_da`, `created_at`) VALUES
(3, 3, NULL, 'in_lavorazione', 'Stato iniziale della pratica', 1, NULL, '2026-08-09 01:03:14'),
(4, 4, NULL, 'inviata', 'Stato iniziale della pratica', 1, NULL, '2026-08-09 01:03:14'),
(5, 5, NULL, 'completata', 'Stato iniziale della pratica', 1, NULL, '2026-08-09 01:03:14');

-- --------------------------------------------------------

--
-- Struttura della tabella `ticket`
--

DROP TABLE IF EXISTS `ticket`;
CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `barca_id` int(11) DEFAULT NULL,
  `indirizzo_consegna` varchar(255) DEFAULT NULL,
  `localizzazione_barca` varchar(255) DEFAULT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `ticket`
--

INSERT INTO `ticket` (`id`, `utente_id`, `barca_id`, `indirizzo_consegna`, `localizzazione_barca`, `operatore_id`, `titolo`, `descrizione`, `localizzazione_richiesta`, `indirizzo_consegna_richiesta`, `contatto_bordo`, `categoria`, `tipo_richiesta`, `copertura`, `costo`, `stato`, `priorita`, `created_at`, `updated_at`, `shipping_fee`) VALUES
(3, 4, 2, 'Porto Marina, 17\n24058 Codigoro (FE)\nItalia', NULL, 12, 'Serbatoio Acque Nere', 'Il serbatoio fa uscire acqua', NULL, NULL, NULL, 'problema_tecnico', NULL, 'da_valutare', NULL, 'in_lavorazione', 'media', '2026-08-05 19:53:26', '2026-09-04 23:48:40', 0.00),
(4, 4, 2, NULL, NULL, 6, 'Parabrezza Rotto', 'Voglio comprarlo', NULL, NULL, NULL, 'informazioni', NULL, 'da_valutare', NULL, 'in_lavorazione', 'media', '2026-08-05 22:29:12', '2026-08-11 11:22:57', 0.00),
(5, 4, 1, NULL, NULL, 3, 'Doga Teak', 'Lo voglio comprare. Dammi il prezzo e tempi do consegna.', NULL, NULL, NULL, 'informazioni', 'ricambi', 'fuori_garanzia', 547.00, 'chiuso', 'urgente', '2026-08-06 21:09:41', '2026-08-08 21:19:56', 0.00),
(6, 1, 3, NULL, NULL, 3, 'Verifica impianto elettrico', 'problema intermittente all\'impianto elettrico della barca.', NULL, NULL, NULL, 'problema_tecnico', 'garanzia', 'da_valutare', NULL, 'in_lavorazione', 'media', '2026-08-09 11:28:53', '2026-08-11 12:12:18', 0.00),
(7, 2, 4, NULL, NULL, NULL, 'PISTONI IDRAULICI', 'VOGLIO UN PREVENTIVO.', NULL, NULL, NULL, 'informazioni', 'ricambi', 'da_valutare', NULL, 'aperto', 'media', '2026-08-09 18:49:43', '2026-08-09 18:49:43', 0.00),
(8, 2, 5, NULL, NULL, NULL, 'VETRI DX E SX', 'PREVENTIVO VETRI E TEMPI DI CONSEGNA', NULL, NULL, NULL, 'informazioni', 'ricambi', 'da_valutare', NULL, 'aperto', 'media', '2026-08-09 19:01:47', '2026-08-09 19:01:47', 0.00),
(9, 1, 6, NULL, NULL, NULL, 'COPRI SCAFO', 'VOGLIO COMPRARLO. MI DATE UN PREVENTIVO ?', NULL, NULL, NULL, 'informazioni', 'ricambi', 'da_valutare', NULL, 'aperto', 'media', '2026-08-09 19:12:34', '2026-08-09 19:12:34', 0.00),
(10, 5, 7, NULL, NULL, NULL, 'SERBATOIO ACQUE CHIARE', 'VOGLIO SAPERE SE LO VENDETE , PREZZO E TEMPI DI CONSEGNA', NULL, NULL, NULL, 'informazioni', 'ricambi', 'da_valutare', NULL, 'aperto', 'media', '2026-08-09 19:39:42', '2026-08-09 19:39:42', 0.00),
(11, 5, 8, NULL, NULL, NULL, 'Parabrezza Rotto', 'PREZZO E TEMPI DI CONSEGNA', NULL, NULL, NULL, 'informazioni', 'ricambi', 'da_valutare', NULL, 'aperto', 'media', '2026-08-09 20:14:52', '2026-08-09 20:14:52', 0.00),
(12, 5, 7, 'Via Pacciotti 20, Puglia , 34056', 'PUGLIA', NULL, 'Caricabatteria', 'Prezzo e tempi di consegna', NULL, NULL, NULL, 'informazioni', 'ricambi', 'da_valutare', NULL, 'aperto', 'media', '2026-08-10 14:22:09', '2026-08-10 14:22:09', 0.00),
(13, 5, 9, 'Via Vezzoli 17, 24054 Calcio, Bergamo', 'PORTO DI GENOVA', NULL, 'TEAK PER BARCA', 'PREZZO E TEMPI DI CONSEGNA', NULL, NULL, NULL, 'informazioni', 'ricambi', 'da_valutare', NULL, 'in_lavorazione', 'media', '2026-08-10 14:39:17', '2026-08-10 18:44:47', 0.00);

-- --------------------------------------------------------

--
-- Struttura della tabella `ticket_allegati`
--

DROP TABLE IF EXISTS `ticket_allegati`;
CREATE TABLE `ticket_allegati` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `ticket_voce_id` int(11) DEFAULT NULL,
  `tipo` enum('foto','video','documento') NOT NULL,
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

--
-- Dump dei dati per la tabella `ticket_allegati`
--

INSERT INTO `ticket_allegati` (`id`, `ticket_id`, `ticket_voce_id`, `tipo`, `descrizione`, `nome_file_originale`, `nome_file_salvato`, `mime_type`, `dimensione_file`, `durata_secondi`, `nome_anteprima`, `caricato_da`, `visibile_cliente`, `consenso_analisi_ai`, `created_at`) VALUES
(1, 11, NULL, 'foto', 'Allegato iniziale della richiesta', 'PARABREZZA.webp', '1786306492606-ca367f6e-d7b3-4618-84c9-6040428482bd.webp', 'image/webp', 20602, NULL, NULL, 5, 1, 0, '2026-08-09 20:14:52'),
(2, 10, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'serbatoio_acqua_chiare.jpg', '1786352537798-c3dd4957-263c-4637-acaa-408f2024820d.jpg', 'image/jpeg', 36380, NULL, NULL, 5, 1, 0, '2026-08-10 09:02:17'),
(3, 11, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'PARABREZZA.webp', '1786352608349-a5ba085f-9938-42c6-bd64-2a2419ede5e5.webp', 'image/webp', 20602, NULL, NULL, 5, 1, 0, '2026-08-10 09:03:28'),
(4, 11, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'Parabrezza - 1.jpg', '1786352842446-fa3c32b9-ef35-40db-be85-58142fbeba98.jpg', 'image/jpeg', 106096, NULL, NULL, 5, 1, 0, '2026-08-10 09:07:22'),
(5, 12, NULL, 'foto', 'Allegato iniziale della richiesta', 'caricabatteria.webp', '1786371729220-a2729d47-5eea-4c58-a6e6-f67846bf1718.webp', 'image/webp', 33556, NULL, NULL, 5, 1, 0, '2026-08-10 14:22:09'),
(6, 12, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'caricabatteria.webp', '1786371801147-f5bb60a7-216a-4090-b438-16ce488d0378.webp', 'image/webp', 33556, NULL, NULL, 5, 1, 0, '2026-08-10 14:23:21'),
(7, 12, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'caricabatteria.webp', '1786371953578-f4f3a711-22ee-42c4-bd14-b44f2f58beaf.webp', 'image/webp', 33556, NULL, NULL, 5, 1, 0, '2026-08-10 14:25:53'),
(8, 13, NULL, 'foto', 'Allegato iniziale della richiesta', 'TEAK.jpeg', '1786372757449-395cd6ed-c379-42dd-b3f6-6ae78cc9b966.jpeg', 'image/jpeg', 434734, NULL, NULL, 5, 1, 0, '2026-08-10 14:39:17'),
(9, 3, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'serbatoio acque nere.jpg', '1786396778620-1cd1a575-bb19-410e-a9bd-765a41e1113d.jpg', 'image/jpeg', 195099, NULL, NULL, 4, 1, 0, '2026-08-10 21:19:38'),
(10, 5, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'doga teak.jpg', '1786396908904-08f902d3-c047-437e-b36c-e3bf05ec4405.jpg', 'image/jpeg', 393881, NULL, NULL, 4, 1, 0, '2026-08-10 21:21:48'),
(11, 4, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'parabrezza rotto.webp', '1786397084385-f72c0074-5ef1-43fa-a270-65ab9ce6e77d.webp', 'image/webp', 23716, NULL, NULL, 4, 1, 0, '2026-08-10 21:24:44'),
(15, 10, NULL, 'documento', 'Allegato aggiunto alla conversazione', 'Client Privacy Policy.jpg', '1786414618633-6c154654-7946-4dda-af0f-9a263073a3ac.jpg', 'image/jpeg', 189862, NULL, NULL, 5, 1, 0, '2026-08-11 02:16:58'),
(16, 10, NULL, 'documento', 'Allegato aggiunto alla conversazione', 'New Client Form.webp', '1786414633048-c0da2dd8-ba74-4e71-a9d9-af91a1197a0f.webp', 'image/webp', 11618, NULL, NULL, 5, 1, 0, '2026-08-11 02:17:13'),
(17, 6, NULL, 'foto', 'Allegato aggiunto alla conversazione', 'Impianto Elettrico.jpg', '1786450322742-3f12909f-2d20-49e2-acdd-4d010cc276fd.jpg', 'image/jpeg', 112922, NULL, NULL, 3, 1, 0, '2026-08-11 12:12:02');

-- --------------------------------------------------------

--
-- Struttura della tabella `ticket_voci`
--

DROP TABLE IF EXISTS `ticket_voci`;
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

DROP TABLE IF EXISTS `utenti`;
CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `indirizzo_residenza` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `ruolo` enum('utente','operatore','tecnico','ufficio_tecnico','capo_produzione','ingegnere','commerciale','contabile','ceo','amministrazione') NOT NULL DEFAULT 'utente',
  `funzione` varchar(100) DEFAULT NULL,
  `tipo_operatore` enum('after_sales','consulente') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `puo_gestire_operatori` tinyint(1) NOT NULL DEFAULT 0,
  `attivo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `nome`, `cognome`, `email`, `telefono`, `indirizzo_residenza`, `password_hash`, `ruolo`, `funzione`, `tipo_operatore`, `created_at`, `puo_gestire_operatori`, `attivo`) VALUES
(1, 'Linda', 'Neri', 'linda@hotmail.com', '2256485469', NULL, '$2b$10$rmlebZ8r7ARi.d7PPz./QO2lvvnnLsBIk6sDAmsfv9yJi7iXdwpnW', 'utente', NULL, NULL, '2026-08-03 21:50:06', 0, 1),
(2, 'Franco', 'Bianchi', 'franco@gmail.com', '3128461512', NULL, '$2b$10$rmlebZ8r7ARi.d7PPz./QO2lvvnnLsBIk6sDAmsfv9yJi7iXdwpnW', 'utente', NULL, NULL, '2026-08-04 19:53:14', 0, 1),
(3, 'MORENA', 'TIRANA', 'morena@helpdesk.it', '3299554861', NULL, '$2b$12$bRZhwW/2P9HnyZ0W0eYWFueFVdBJJgObY2GjcIRubJNFhVEBCzs5q', 'operatore', 'Main Operator', 'after_sales', '2026-08-05 19:20:21', 1, 1),
(4, 'Mario', 'Rossi', 'mario@gmail.com', '3331234567', 'Via Papa Clemente 5, 35065 Cagliari, Sardegna', '$2b$10$.SaEfS4FaWbgpmFTf/9vPO8hgQK2flKwhem0B4jRSBYwh7BYG.Fea', 'utente', NULL, NULL, '2026-08-05 19:50:59', 0, 1),
(5, 'Claudia', 'Verdi', 'claudia@gmail.com', '3295629563', 'Via Vezzoli 17, 24054 Calcio, Bergamo', '$2b$10$LH6anzFqY7R4FcKYAez0IOfnhZmqhqzdOZw1fhIt7UR18oqlJ9PD.', 'utente', NULL, NULL, '2026-08-08 07:20:13', 0, 1),
(6, 'Filippo', 'Parietti', 'filippo@mail.com', '326548954', NULL, '$2b$12$0.KABZzbvfFQi/7ay.djpes9r620l74unHny7SYleroIMkZb26FMO', 'operatore', 'Operatore Ricambi', 'after_sales', '2026-08-10 19:41:56', 0, 1),
(7, 'Matteo', 'Re', 'matteo@mail.com', '3264788455', NULL, '$2b$12$6f6qpLDWKUw7f3FSXtwIleCEOmShDTi8522e20ZCfFv.B6UlS3zzW', 'operatore', 'Capo Produzione', 'consulente', '2026-08-10 19:43:00', 0, 1),
(8, 'Massimo', 'Domenghini', 'massimo@mail.com', '3264578852', NULL, '$2b$12$vZ8LMvZ.gq.x8IByLW/hWu28PVbCF2.V4MwypiI3TMZdVTbj19xGC', 'operatore', 'Vice Capo Produzione', 'consulente', '2026-08-10 19:44:11', 0, 1),
(9, 'Giovanni', 'Ferrari', 'giovanni@mail.com', '3264578786', NULL, '$2b$12$qSCK/PUZmzFbwYzlpX957uaGWjaQlhbiA4SIpLnSV.VuN6derX96q', 'tecnico', 'Elettricista', 'consulente', '2026-08-10 19:45:34', 0, 1),
(10, 'Paolo', 'Chiodini', 'paolo@mail.com', '1256487866', NULL, '$2b$12$TmVsGrboE/QVxTS2SkpKI.jpPHBavokfK/70Q8cPwOYmKVn1Qh.sq', 'operatore', 'Motorrista', 'consulente', '2026-08-10 19:46:30', 0, 1),
(11, 'Emanuele', 'Zanchetti', 'emanuele@mail.com', '5698485656', NULL, '$2b$12$YgCSdgraYK/LV4U0/I9oFeMPmOvAb72i0rSIb6V2kl/d9O55UJTyi', 'operatore', 'Responsabile Trasferte', 'consulente', '2026-08-10 19:49:27', 0, 1),
(12, 'Lorenzo', 'Vezzoli', 'lorenzo@mail.com', '32656564488', NULL, '$2b$12$K7gvlUGhMdJeESESEhQzluY11lMKyB5zHrOsaAbNh9In5e2NWiPIq', 'operatore', 'Ufficio Tecnico & Acquisti', 'consulente', '2026-08-10 19:50:37', 0, 1),
(13, 'Christian', 'Furstenau', 'christian@mail.com', '4548786654', NULL, '$2b$12$LOhE2K2y3J7bzrzHj8wNkOCX8adoynqS0JR83fc5ShHnT8g65GVwe', 'operatore', 'Ingegnere', 'consulente', '2026-08-10 19:51:39', 0, 1),
(14, 'Matteo', 'Rigobello', 'rigobello@mail.com', '3464458879', NULL, '$2b$12$XQG/NvRrB7pNM7QuRiWzkuHzgNV3d4VG25Eh.qDnPzFJTo/h6BqtC', 'operatore', 'Verniciatore', 'consulente', '2026-08-10 19:53:26', 0, 1),
(15, 'Francesco', 'Parietti', 'parietti@mail.com', '1254545464', NULL, '$2b$12$Hy2Rphg3fGUcy0BTCFUuz.0HoCypSIqe3n7NnpU6ZRImyqh9qbs5e', 'operatore', 'Responsabile After Sales', 'consulente', '2026-08-10 19:54:45', 0, 1),
(16, 'Stefano', 'Notarantonio', 'stefano@mail.com', '547687764', NULL, '$2b$12$q.DhUu9PZX5Io.4wldo78.5dlhE5/iHYRYMih52R/5tU.cb/z6kQi', 'operatore', 'CEO', 'consulente', '2026-08-10 19:55:38', 0, 1),
(17, 'Sonia', 'Caroli', 'sonia@mail.com', '4565689898', NULL, '$2b$12$w9H7dcY7PXp9j2rYsAAc4OoSURMRG4P/ew84KvPabhAJQm1okiqmK', 'operatore', 'Responsabile Amministrazione', 'consulente', '2026-08-10 19:57:03', 0, 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti_specializzazioni`
--

DROP TABLE IF EXISTS `utenti_specializzazioni`;
CREATE TABLE `utenti_specializzazioni` (
  `utente_id` int(11) NOT NULL,
  `specializzazione_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `valutazioni_servizio`
--

DROP TABLE IF EXISTS `valutazioni_servizio`;
CREATE TABLE `valutazioni_servizio` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `utente_id` int(11) NOT NULL,
  `qualita_prodotto` tinyint(3) UNSIGNED NOT NULL,
  `tempistiche` tinyint(3) UNSIGNED NOT NULL,
  `servizio_cliente` tinyint(3) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Struttura della tabella `valutazioni_tecniche`
--

DROP TABLE IF EXISTS `valutazioni_tecniche`;
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

DROP TABLE IF EXISTS `workflow_pratiche`;
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
-- Dump dei dati per la tabella `workflow_pratiche`
--

INSERT INTO `workflow_pratiche` (`id`, `ticket_id`, `fase`, `disponibilita_magazzino`, `aggiornato_da`, `created_at`, `updated_at`) VALUES
(3, 3, 'in_lavorazione', 'da_verificare', NULL, '2026-08-09 01:01:56', '2026-08-09 01:01:56'),
(4, 4, 'inviata', 'da_verificare', NULL, '2026-08-09 01:01:56', '2026-08-09 01:01:56'),
(5, 5, 'completata', 'da_verificare', NULL, '2026-08-09 01:01:56', '2026-08-09 01:01:56');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `allegati_consultazioni`
--
ALTER TABLE `allegati_consultazioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultazione_id` (`consultazione_id`),
  ADD KEY `caricato_da` (`caricato_da`),
  ADD KEY `fk_allegato_risposta` (`risposta_id`);

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
-- Indici per le tabelle `articoli_commerciali_ticket`
--
ALTER TABLE `articoli_commerciali_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_articoli_commerciali_ticket` (`ticket_id`);

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
-- Indici per le tabelle `consultazioni_ticket`
--
ALTER TABLE `consultazioni_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_consultazione_ticket` (`ticket_id`),
  ADD KEY `fk_consultazione_richiedente` (`richiesta_da`),
  ADD KEY `fk_consultazione_consulente` (`consulente_id`);

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
-- Indici per le tabelle `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_password_reset_utente` (`utente_id`),
  ADD KEY `idx_password_reset_scadenza` (`scade_il`);

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
-- Indici per le tabelle `richieste_interne_ticket`
--
ALTER TABLE `richieste_interne_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_richiesta_interna_ticket` (`ticket_id`),
  ADD KEY `fk_richiesta_interna_autore` (`richiesto_da`),
  ADD KEY `fk_richiesta_interna_destinatario` (`assegnato_a`);

--
-- Indici per le tabelle `ric_righe`
--
ALTER TABLE `ric_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_riga_ric` (`ric_id`);

--
-- Indici per le tabelle `risposte_consultazioni`
--
ALTER TABLE `risposte_consultazioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultazione_id` (`consultazione_id`),
  ADD KEY `autore_id` (`autore_id`);

--
-- Indici per le tabelle `risposte_interne_ticket`
--
ALTER TABLE `risposte_interne_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_risposta_richiesta_interna` (`richiesta_interna_id`),
  ADD KEY `fk_risposta_interna_autore` (`autore_id`);

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
-- Indici per le tabelle `valutazioni_servizio`
--
ALTER TABLE `valutazioni_servizio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_valutazione_ticket` (`ticket_id`),
  ADD KEY `fk_valutazione_utente` (`utente_id`);

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
-- AUTO_INCREMENT per la tabella `allegati_consultazioni`
--
ALTER TABLE `allegati_consultazioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `analisi_ai_ticket`
--
ALTER TABLE `analisi_ai_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `articoli_commerciali_ticket`
--
ALTER TABLE `articoli_commerciali_ticket`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la tabella `categorie_componenti`
--
ALTER TABLE `categorie_componenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT per la tabella `commenti`
--
ALTER TABLE `commenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `comunicazioni_tecniche_cliente`
--
ALTER TABLE `comunicazioni_tecniche_cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `consultazioni_ticket`
--
ALTER TABLE `consultazioni_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `documenti_ticket`
--
ALTER TABLE `documenti_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `escalation_pratiche`
--
ALTER TABLE `escalation_pratiche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `notifiche`
--
ALTER TABLE `notifiche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT per la tabella `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `pratiche_ricambi`
--
ALTER TABLE `pratiche_ricambi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ric`
--
ALTER TABLE `ric`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `richieste_interne_ticket`
--
ALTER TABLE `richieste_interne_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ric_righe`
--
ALTER TABLE `ric_righe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `risposte_consultazioni`
--
ALTER TABLE `risposte_consultazioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `risposte_interne_ticket`
--
ALTER TABLE `risposte_interne_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `specializzazioni`
--
ALTER TABLE `specializzazioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT per la tabella `storico_stati`
--
ALTER TABLE `storico_stati`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT per la tabella `storico_workflow`
--
ALTER TABLE `storico_workflow`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT per la tabella `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `ticket_allegati`
--
ALTER TABLE `ticket_allegati`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT per la tabella `ticket_voci`
--
ALTER TABLE `ticket_voci`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT per la tabella `valutazioni_servizio`
--
ALTER TABLE `valutazioni_servizio`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `allegati_consultazioni`
--
ALTER TABLE `allegati_consultazioni`
  ADD CONSTRAINT `allegati_consultazioni_ibfk_1` FOREIGN KEY (`consultazione_id`) REFERENCES `consultazioni_ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `allegati_consultazioni_ibfk_2` FOREIGN KEY (`caricato_da`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_allegato_risposta` FOREIGN KEY (`risposta_id`) REFERENCES `risposte_consultazioni` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `articoli_commerciali_ticket`
--
ALTER TABLE `articoli_commerciali_ticket`
  ADD CONSTRAINT `fk_articoli_commerciali_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `consultazioni_ticket`
--
ALTER TABLE `consultazioni_ticket`
  ADD CONSTRAINT `fk_consultazione_consulente` FOREIGN KEY (`consulente_id`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_consultazione_richiedente` FOREIGN KEY (`richiesta_da`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_consultazione_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `richieste_interne_ticket`
--
ALTER TABLE `richieste_interne_ticket`
  ADD CONSTRAINT `fk_richiesta_interna_autore` FOREIGN KEY (`richiesto_da`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_richiesta_interna_destinatario` FOREIGN KEY (`assegnato_a`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_richiesta_interna_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ric_righe`
--
ALTER TABLE `ric_righe`
  ADD CONSTRAINT `fk_riga_ric` FOREIGN KEY (`ric_id`) REFERENCES `ric` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `risposte_consultazioni`
--
ALTER TABLE `risposte_consultazioni`
  ADD CONSTRAINT `risposte_consultazioni_ibfk_1` FOREIGN KEY (`consultazione_id`) REFERENCES `consultazioni_ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `risposte_consultazioni_ibfk_2` FOREIGN KEY (`autore_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `risposte_interne_ticket`
--
ALTER TABLE `risposte_interne_ticket`
  ADD CONSTRAINT `fk_risposta_interna_autore` FOREIGN KEY (`autore_id`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `fk_risposta_richiesta_interna` FOREIGN KEY (`richiesta_interna_id`) REFERENCES `richieste_interne_ticket` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `valutazioni_servizio`
--
ALTER TABLE `valutazioni_servizio`
  ADD CONSTRAINT `fk_valutazione_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_valutazione_utente` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

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
-- --------------------------------------------------------

--
-- Struttura della tabella `articoli_knowledge_base`
--

DROP TABLE IF EXISTS `articoli_knowledge_base`;
CREATE TABLE `articoli_knowledge_base` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titolo` varchar(200) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `contenuto` text NOT NULL,
  `pubblicato` tinyint(1) NOT NULL DEFAULT 1,
  `creato_da` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_kb_creato_da` (`creato_da`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `articoli_knowledge_base`
  ADD CONSTRAINT `fk_kb_creato_da` FOREIGN KEY (`creato_da`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
