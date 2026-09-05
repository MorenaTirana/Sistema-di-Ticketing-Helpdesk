# Sistema di Ticketing / Helpdesk

Applicazione web per la gestione delle richieste di assistenza tecnica nel settore della nautica, tramite ticket.

## Obiettivo del progetto

Il sistema permette ai clienti di aprire ticket di assistenza relativi alle proprie imbarcazioni, agli operatori di gestirli (assegnazione, priorità, costi, documenti) e ai tecnici interni di fornire consulenza specialistica su richiesta.

## Ruoli del sistema

### Utente (cliente)

* Si registra e accede all'applicazione.
* Associa una o più imbarcazioni al proprio profilo.
* Apre un ticket relativo a un'imbarcazione, allegando foto/video del problema.
* Visualizza i propri ticket, il relativo stato, i costi e la cronologia.
* Aggiunge commenti ai propri ticket.
* Visualizza documenti e comunicazioni tecniche resi visibili dall'operatore.
* Conferma la risoluzione (chiudendo il ticket) oppure segnala che il problema persiste.

### Operatore

* Visualizza ed elenca tutti i ticket.
* Assegna priorità, stato, operatore responsabile e costi ai ticket.
* Gestisce le imbarcazioni e, se principale, gli altri operatori.
* Richiede consulenze tecniche ai tecnici interni.
* Carica documenti (preventivi, fatture, ecc.) e comunicazioni tecniche per il cliente.
* Gestisce le Richieste Interne Componenti (RIC).

### Tecnico

* Fornisce consulenza tecnica sui ticket per cui è stato interpellato da un operatore.
* Accede solamente ai ticket per i quali ha ricevuto una richiesta di consultazione.

> Lo schema del database prevede ulteriori ruoli gestionali (ufficio tecnico, capo produzione, ingegnere, commerciale, contabile, CEO, amministrazione) come base per sviluppi futuri: ad oggi solo utente, operatore e tecnico sono gestiti attivamente dal backend.

## Funzionalità implementate

* Autenticazione completa: registrazione, login, logout, recupero e reimpostazione password, sessioni server-side (`express-session`), password protette con `bcrypt`.
* Controllo delle autorizzazioni per ruolo su tutte le API.
* Ciclo di vita completo del ticket: creazione con allegati, stato, priorità, assegnazione, costo, storico dei cambi di stato, chiusura confermata dal cliente.
* Gestione delle imbarcazioni associate ai clienti.
* Commenti sui ticket.
* Allegati (foto, video, documenti) sui ticket.
* Consultazioni tecniche tra operatore e tecnici interni, con risposte e allegati.
* Richieste Interne Componenti (RIC) e upload/download documenti, con visibilità configurabile per il cliente.
* Comunicazioni tecniche dall'operatore al cliente.
* Notifiche persistenti per gli aggiornamenti sui ticket.
* Validazione degli input lato server e gestione coerente degli errori (codici di stato HTTP appropriati, messaggi applicativi in italiano).

## Tecnologie utilizzate

* HTML, CSS e JavaScript (vanilla) per il frontend.
* Node.js ed Express 5 per il server e le API REST.
* MySQL (MariaDB, tramite XAMPP) per la persistenza dei dati, con pool di connessioni (`mysql2`).
* `express-session` per le sessioni, `bcryptjs` per l'hashing delle password, `multer` per gli upload, `dotenv` per la configurazione.

## Installazione

1. Clonare il repository e installare le dipendenze:

   ```bash
   git clone https://github.com/MorenaTirana/Sistema-di-Ticketing-Helpdesk.git
   cd Sistema-di-Ticketing-Helpdesk
   npm install
   ```

2. Avviare MySQL (ad esempio tramite XAMPP) e creare il database importando lo schema:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

   In alternativa è possibile importare `database/schema.sql` da phpMyAdmin.

3. Copiare `.env.example` in `.env` e compilare i valori (host, credenziali del proprio MySQL locale e una chiave per `SESSION_SECRET`):

   ```
   PORT=3002
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ticketing_helpdesk
   SESSION_SECRET=una_chiave_sicura_a_scelta
   ```

## Avvio

```bash
npm start
```

Il server si avvia su `http://localhost:3002` (o sulla porta indicata in `PORT`).

## Utilizzo

Aprire il browser su `http://localhost:3002/login.html` e accedere con un account esistente, oppure registrarne uno nuovo da `http://localhost:3002/register.html` (i nuovi account vengono creati con ruolo "utente"). Gli account con ruolo operatore o tecnico vanno creati direttamente nel database o da un operatore con permessi di gestione.

### Credenziali di test

Account demo presenti nel seed di `database/schema.sql`, disponibili su un'installazione locale pulita:

| Ruolo | Email | Password |
|---|---|---|
| Operatore | morena@helpdesk.it | Morena123 |
| Utente (cliente) | claudia@gmail.com | Claudia123 |

> Sono account demo validi solo su un database locale di sviluppo: non contengono dati reali né vanno riutilizzati al di fuori di questo ambiente.

## Diagrammi

Il diagramma Entità-Relazione del database e il diagramma dei casi d'uso, generati a partire dallo schema e dal codice reali, sono disponibili in [DIAGRAMMI.md](DIAGRAMMI.md).

## Struttura del progetto

* `client/` — pagine HTML, JavaScript e CSS del frontend.
* `server/` — applicazione Express (routes, controllers, middleware, services).
* `database/` — schema SQL del database.

## Stato del progetto

Funzionante end-to-end per i tre ruoli principali (utente, operatore, tecnico). Progetto completato e pronto per la consegna (vedi `CHECKLIST_ESAME.md`).

### Livello raggiunto (traccia "Sistema di Ticketing / Helpdesk")

* **Livello 1** — completo: registrazione, login, apertura ticket con titolo/descrizione/categoria, elenco e dettaglio dei propri ticket, commenti, visualizzazione dello stato; l'operatore visualizza tutti i ticket, risponde e ne modifica lo stato.
* **Livello 2** — completo: priorità, assegnazione a un operatore, storico dei cambi di stato, filtri per categoria/stato/priorità/operatore, dashboard con conteggi dei ticket, conferma della risoluzione (o segnalazione di persistenza del problema) da parte del cliente.
* **Livello 3** — estensione implementata: caricamento e gestione di allegati (foto, video, documenti) sui ticket, con validazione di tipo e dimensione e visibilità configurabile per il cliente.
