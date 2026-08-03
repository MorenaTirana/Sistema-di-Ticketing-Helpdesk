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