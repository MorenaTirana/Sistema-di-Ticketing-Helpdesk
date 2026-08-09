# Appunti

## 1. Scelta del progetto

Ho scelto la traccia “Sistema di Ticketing / Helpdesk”.

L'obiettivo è realizzare un'applicazione web che consenta agli utenti di aprire richieste di assistenza e agli operatori di gestirle.

Ho scelto questa traccia perché permette di applicare i principali argomenti del corso: autenticazione, database, ruoli, autorizzazioni, validazione, API e interfacce web.

## 2. Tecnologie previste

* HTML per definire la struttura delle pagine.
* CSS per definire l'aspetto grafico.
* JavaScript per gestire il comportamento delle pagine.
* Node.js per eseguire JavaScript nel backend.
* Express per realizzare il server e le API.
* MySQL per salvare i dati in modo persistente.

Ho scelto JavaScript anche per il backend perché permette di utilizzare lo stesso linguaggio sia nel frontend sia nel server.

## 3. Creazione del repository

Ho creato un repository Git chiamato `Sistema-di-Ticketing-Helpdesk`.

Un repository è una cartella controllata da Git, che permette di registrare e confrontare le diverse versioni del progetto.

Il repository locale si trova sul computer. Il repository remoto è la copia pubblicata su GitHub.

## 4. Primo commit

Ho inserito nel README gli obiettivi, gli utenti, le funzionalità previste e le tecnologie del progetto.

Successivamente ho creato un commit per registrare questa prima versione.

* `Ctrl + S` salva il file sul computer.
* Il commit registra una versione nella cronologia Git.
* Il push invia i commit locali al repository remoto su GitHub.

## 5. Stato attuale

Il progetto si trova nella fase di progettazione iniziale. Non sono ancora state implementate le funzionalità dell'applicazione.
## 6. Struttura iniziale dell'applicazione

Ho separato il progetto in tre cartelle:

- `client` per il frontend.
- `server` per il backend.
- `database` per i file SQL.

Questa organizzazione applica la separazione delle responsabilità: ogni parte del progetto ha un compito specifico.

## 7. Inizializzazione di Node.js

Ho eseguito:

`npm init -y`

Il comando ha creato `package.json`, che contiene i metadati, gli script e le dipendenze del progetto Node.js.

Successivamente ho installato Express con:

`npm install express`

Express semplifica la creazione del server, delle rotte e delle risposte HTTP.

La cartella `node_modules` contiene le librerie installate, ma non viene pubblicata su GitHub perché è esclusa dal file `.gitignore`.

Il file `package-lock.json` registra le versioni esatte delle dipendenze.

## 8. Primo server Express

Ho creato `server/app.js` e definito una rotta GET per l'indirizzo `/`.

Quando il browser invia una richiesta GET, il server risponde con il testo “Sistema di Ticketing / Helpdesk”.

Il server utilizza la porta 3002 perché la porta 3001 è già utilizzata da un altro progetto.

Ho aggiunto lo script `start` nel file `package.json`. Il comando:

`npm start`

esegue:

`node server/app.js`

## 9. Collegamento tra frontend e backend

Ho creato il file `client/index.html`, che contiene la prima pagina HTML dell'applicazione.

Nel backend ho utilizzato:

`express.static(path.join(__dirname, "../client"))`

Questo middleware permette al server Express di rendere accessibili al browser i file presenti nella cartella `client`.

`__dirname` rappresenta la cartella del file `app.js`. Il percorso `../client` risale dalla cartella `server` alla cartella principale e poi entra nella cartella `client`.

Quando il browser richiede l'indirizzo `/`, Express restituisce automaticamente il file `index.html`.

Durante la prova è apparso l'errore `Cannot GET /` perché il percorso della cartella `client` era scritto in modo errato. Il server era attivo, ma non riusciva a trovare il file da restituire.

## 10. Separazione tra HTML e CSS

Ho creato il file `client/css/style.css` per gestire la presentazione grafica dell'applicazione.

Il file HTML contiene la struttura e il contenuto della pagina. Il file CSS contiene colori, spaziature, dimensioni e disposizione degli elementi.

Ho collegato il foglio CSS alla pagina HTML tramite:

`<link rel="stylesheet" href="css/style.css">`

Questa separazione rende il codice più ordinato e permette di utilizzare lo stesso foglio di stile in più pagine.

In una regola CSS:

- il selettore identifica l'elemento;
- la proprietà indica che cosa modificare;
- il valore stabilisce la modifica da applicare.

## 11. Progettazione del database

Ho progettato il database relazionale `ticketing_helpdesk` con tre tabelle iniziali:

- `utenti`
- `ticket`
- `commenti`

Un utente può aprire molti ticket e scrivere molti commenti. Un ticket può contenere molti commenti.

Le chiavi primarie identificano univocamente i record. Le chiavi esterne collegano le tabelle e garantiscono l'integrità delle relazioni.

Ho salvato la struttura nel file `database/schema.sql`, in modo che il database possa essere ricreato su un altro computer.

## 12. Collegamento tra Node.js e MySQL

Ho installato `mysql2` per permettere al backend di comunicare con MySQL.

Ho installato `dotenv` per leggere la configurazione dal file `.env`, evitando di inserire direttamente nel codice i dati di connessione.

Il file `.env` non viene pubblicato su GitHub. Il file `.env.example` documenta invece le variabili necessarie.

Nel file `server/db.js` ho creato un pool di connessioni. Il pool riutilizza le connessioni al database e permette di gestire più richieste in modo efficiente.

Prima di avviare Express, il backend verifica che la connessione a MySQL funzioni. In caso di errore, il blocco `catch` mostra un messaggio esplicativo.

## 13. API di registrazione

Ho installato `bcryptjs` per trasformare le password in hash prima di salvarle nel database.

Ho separato la funzionalità in:

- `routes/authRoutes.js`, che definisce la rotta;
- `controllers/authController.js`, che contiene la logica.

La rotta è:

`POST /api/auth/register`

Il prefisso `/api/auth` viene definito in `app.js`, mentre `/register` viene definito nel router.

Il controller:

1. riceve i dati da `req.body`;
2. verifica che i campi siano presenti;
3. controlla la lunghezza della password;
4. normalizza l'email;
5. verifica che l'email non esista;
6. genera l'hash della password;
7. inserisce l'utente nel database;
8. restituisce una risposta JSON.

Ho utilizzato query parametrizzate con il simbolo `?`. I valori vengono trasmessi separatamente dalla query, riducendo il rischio di SQL injection.

La registrazione restituisce:

- `201 Created` quando l'utente viene creato;
- `400 Bad Request` quando i dati non sono validi;
- `409 Conflict` quando l'email esiste già;
- `500 Internal Server Error` per errori imprevisti.

Ho verificato il controllo dei duplicati inviando due volte la stessa registrazione. La seconda richiesta è stata correttamente rifiutata.
## 14. Registrazione dal frontend

Ho creato la pagina `register.html` con un modulo per nome, cognome, email e password.

Ho creato `client/js/register.js` per intercettare l'invio del modulo tramite l'evento `submit`.

`event.preventDefault()` impedisce il normale ricaricamento della pagina.

JavaScript raccoglie i valori degli input e utilizza `fetch()` per inviare una richiesta POST a:

`/api/auth/register`

I dati vengono trasformati in JSON tramite `JSON.stringify()`.

Il backend restituisce una risposta JSON. Il frontend mostra un messaggio verde in caso di successo e rosso in caso di errore.

Durante lo sviluppo il modulo non funzionava perché l'ID cercato da JavaScript era diverso dall'ID presente nell'HTML. Questo dimostra che i riferimenti tra HTML e JavaScript devono essere esattamente coerenti.

Ho inoltre separato:

- HTML per la struttura;
- CSS per la presentazione;
- JavaScript per il comportamento;
- backend per validazione e persistenza.

## 15. Login e gestione della sessione

Ho implementato il login tramite la rotta:

`POST /api/auth/login`

Il backend cerca l'utente tramite email e utilizza `bcrypt.compare()` per confrontare la password inserita con l'hash salvato nel database.

In caso di credenziali corrette, il server salva nella sessione:

- id;
- nome;
- cognome;
- email;
- ruolo.

Ho utilizzato `express-session` per mantenere l'identità dell'utente tra richieste HTTP differenti.

La rotta:

`GET /api/auth/me`

restituisce l'utente presente nella sessione. Se la sessione non esiste, restituisce `401 Unauthorized`.

La rotta:

`POST /api/auth/logout`

distrugge la sessione ed elimina il cookie.

La dashboard utilizza `/api/auth/me` per verificare l'autenticazione. Se l'utente non è autenticato, JavaScript lo reindirizza alla pagina di login.

Durante il test erano attivi due processi Node. Ho chiuso entrambi e avviato un solo server, evitando che venisse utilizzata una versione precedente dell'applicazione.

## 16. Creazione dei ticket

Ho creato un middleware `requireAuth` che controlla la presenza dell'utente nella sessione prima di consentire l'accesso alle API protette.

Ho implementato la rotta:

`POST /api/tickets`

Il controller recupera l'ID dell'utente dalla sessione e non dal browser. Questo impedisce a un utente di creare ticket a nome di un'altra persona.

Il controller valida:

- presenza dei campi;
- lunghezza minima del titolo;
- lunghezza minima della descrizione;
- categoria selezionata;
- autenticazione dell'utente.

La pagina `new-ticket.html` contiene il modulo. Il file `new-ticket.js` utilizza `fetch()` per inviare i dati al backend in formato JSON.

Durante il test MySQL restituiva `ER_BAD_FIELD_ERROR` perché la colonna del database era stata scritta `desrizione`, mentre il controller utilizzava `descrizione`.

Ho diagnosticato il problema leggendo il log del backend e verificando il database realmente utilizzato con:

`SELECT DATABASE()`

e le colonne con:

`SHOW COLUMNS FROM ticket`

Ho risolto rinominando la colonna tramite `ALTER TABLE`.

Questa verifica dimostra l'importanza di mantenere coerenti schema SQL, query e nomi utilizzati nel codice.
## 18. Dettaglio del ticket e commenti

Ho implementato la rotta:

`GET /api/tickets/:id`

Il parametro dinamico `:id` viene letto tramite `req.params.id`.

Il controller verifica:

- che l'ID sia valido;
- che il ticket esista;
- che un utente possa aprire soltanto un proprio ticket;
- che un operatore possa aprire qualsiasi ticket.

Ho creato `ticket-detail.html` e `ticket-detail.js`. L'ID viene letto dall'indirizzo tramite `URLSearchParams`.

Esempio:

`ticket-detail.html?id=1`

Per i commenti ho implementato:

- `GET /api/tickets/:id/comments`
- `POST /api/tickets/:id/comments`

La funzione `checkTicketAccess()` centralizza il controllo di accesso e viene riutilizzata sia per leggere sia per creare commenti.

Dopo l'invio di un commento, il frontend richiama nuovamente l'API GET e aggiorna l'elenco senza ricaricare tutta la pagina.

Titolo, descrizione e commenti vengono inseriti nella pagina in modo sicuro tramite `textContent` o `escapeHtml()`.
## Sistema delle notifiche

Ho implementato un sistema di notifiche persistenti per informare
l'utente delle azioni eseguite dall'operatore sui suoi ticket.

Ho creato la tabella `notifiche`, collegata alle tabelle `utenti`
e `ticket` tramite chiavi esterne.

Ho creato il servizio `notificationService.js` per centralizzare
il salvataggio delle notifiche nel database.

Quando un operatore modifica lo stato di un ticket oppure aggiunge
un commento, il backend crea una notifica destinata al proprietario
del ticket.

Ho inoltre creato:

- `notificationController.js`, che recupera e aggiorna le notifiche;
- `notificationRoutes.js`, che espone le relative API;
- una campanella nella dashboard;
- un contatore delle notifiche non lette;
- un pannello con l'elenco delle notifiche.

Quando l'utente seleziona una notifica, questa viene segnata come
letta e viene aperto il dettaglio del ticket interessato.

La persistenza nel database permette di conservare le notifiche
anche dopo la chiusura del browser o il riavvio del server.

## Verifica finale del progetto

Per controllare lo stato di completamento del progetto ho creato
il file `CHECKLIST_ESAME.md`.

La checklist distingue le funzionalità già implementate da quelle
che devono ancora essere testate o completate.

