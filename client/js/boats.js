const boatForm = document.getElementById("boatForm");
const boatsList = document.getElementById("boatsList");

const boatMessage =
    document.getElementById("boatMessage");

const logoutButton =
    document.getElementById("logoutButton");

const annoProduzione =
    document.getElementById("annoProduzione");


// Impedisce di inserire un anno futuro
annoProduzione.max = new Date().getFullYear();


function formatDate(data) {
    if (!data) {
        return "Non indicata";
    }

    return new Date(data).toLocaleDateString(
        "it-IT",
        {
            timeZone: "UTC"
        }
    );
}


function createDetail(label, value) {
    const elemento = document.createElement("p");

    const etichetta = document.createElement("strong");
    etichetta.textContent = `${label}: `;

    const contenuto = document.createElement("span");
    contenuto.textContent = value;

    elemento.appendChild(etichetta);
    elemento.appendChild(contenuto);

    return elemento;
}


function getWarrantyStatus(barca) {
    if (!barca.garanzia_scadenza_il) {
        return {
            testo: "Garanzia non registrata",
            classe: "warranty-unknown"
        };
    }

    const oggi = new Date();
    const scadenza = new Date(
        barca.garanzia_scadenza_il
    );

    if (scadenza >= oggi) {
        return {
            testo: "Garanzia attiva",
            classe: "warranty-active"
        };
    }

    return {
        testo: "Garanzia scaduta",
        classe: "warranty-expired"
    };
}


function showBoats(barche) {
    boatsList.innerHTML = "";

    if (barche.length === 0) {
        const testo = document.createElement("p");
        testo.className = "empty-message";

        testo.textContent =
            "Non hai ancora registrato nessuna barca.";

        boatsList.appendChild(testo);
        return;
    }

    const griglia = document.createElement("div");
    griglia.className = "boats-grid";

    barche.forEach((barca) => {
        const card = document.createElement("article");
        card.className = "boat-card";

        const intestazione =
            document.createElement("div");

        intestazione.className = "boat-card-header";

        const titolo = document.createElement("h3");
        titolo.textContent = barca.modello;

        const matricola = document.createElement("p");
        matricola.textContent = barca.matricola;

        intestazione.appendChild(titolo);
        intestazione.appendChild(matricola);

        const statoGaranzia =
            getWarrantyStatus(barca);

        const badge = document.createElement("span");

        badge.className =
            `warranty-badge ${statoGaranzia.classe}`;

        badge.textContent = statoGaranzia.testo;

        const dettagli = document.createElement("div");
        dettagli.className = "boat-details";

        dettagli.appendChild(
            createDetail(
                "Anno di produzione",
                String(barca.anno_produzione)
            )
        );

        dettagli.appendChild(
            createDetail(
                "Localizzazione",
                barca.localizzazione
            )
        );

        dettagli.appendChild(
            createDetail(
                "Indirizzo di consegna",
                barca.indirizzo_consegna
            )
        );

        dettagli.appendChild(
            createDetail(
                "Attivazione garanzia",
                formatDate(
                    barca.garanzia_attivata_il
                )
            )
        );

        dettagli.appendChild(
            createDetail(
                "Scadenza garanzia",
                formatDate(
                    barca.garanzia_scadenza_il
                )
            )
        );

        card.appendChild(intestazione);
        card.appendChild(badge);
        card.appendChild(dettagli);

        griglia.appendChild(card);
    });

    boatsList.appendChild(griglia);
}


async function loadBoats() {
    try {
        const response = await fetch("/api/boats");
        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        showBoats(risultato.barche);
    } catch (error) {
        boatsList.textContent = error.message;
    }
}


boatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    boatMessage.textContent =
        "Registrazione della barca in corso...";

    boatMessage.className = "form-message";

    const datiBarca = {
        modello:
            document.getElementById("modello").value,

        matricola:
            document.getElementById("matricola").value,

        anno_produzione:
            annoProduzione.value,

        localizzazione:
            document.getElementById(
                "localizzazione"
            ).value,

        indirizzo_consegna:
            document.getElementById(
                "indirizzoConsegna"
            ).value,

        garanzia_attivata_il:
            document.getElementById(
                "garanziaAttivataIl"
            ).value || null
    };

    try {
        const response = await fetch("/api/boats", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datiBarca)
        });

        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        boatMessage.textContent =
            risultato.message;

        boatMessage.className =
            "form-message success-message";

        boatForm.reset();

        await loadBoats();
    } catch (error) {
        boatMessage.textContent = error.message;

        boatMessage.className =
            "form-message error-message";
    }
});


logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        window.location.href = "login.html";
    } catch (error) {
        boatMessage.textContent = error.message;

        boatMessage.className =
            "form-message error-message";
    }
});


loadBoats();