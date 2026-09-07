const averageTime = document.getElementById("averageTime");
const averageDescription = document.getElementById("averageDescription");
const resolutionList = document.getElementById("resolutionList");
const message = document.getElementById("message");

function formatDate(value) {
    if (!value) return "Non disponibile";
    return new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function daysBetween(start, end) {
    return Math.max(0, (new Date(end) - new Date(start)) / 86400000);
}

function createField(label, value) {
    const item = document.createElement("div");
    const title = document.createElement("span");
    const content = document.createElement("strong");
    title.className = "resolution-label";
    content.className = "resolution-value";
    title.textContent = label;
    content.textContent = value;
    item.append(title, content);
    return item;
}

async function loadResolutionTimes() {
    try {
        const response = await fetch("/api/tickets");
        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Impossibile caricare i ticket");

        const tickets = Array.isArray(result.ticket) ? result.ticket : [];
        const completed = tickets.filter(ticket => ticket.stato === "risolto" || ticket.stato === "chiuso");
        const completedDays = completed.map(ticket => daysBetween(ticket.created_at, ticket.updated_at));

        averageTime.textContent = completedDays.length
            ? `${(completedDays.reduce((sum, value) => sum + value, 0) / completedDays.length).toFixed(1)} giorni`
            : "Nessun ticket risolto";
        averageDescription.textContent = `Calcolato su ${completedDays.length} ticket risolti.`;

        resolutionList.replaceChildren();
        if (!tickets.length) {
            resolutionList.innerHTML = "<p>Nessun ticket disponibile.</p>";
            return;
        }

        tickets.forEach(ticket => {
            const finished = ticket.stato === "risolto" || ticket.stato === "chiuso";
            const end = finished ? ticket.updated_at : new Date();
            const card = document.createElement("article");
            const title = document.createElement("h3");
            const data = document.createElement("div");
            card.className = "resolution-card";
            data.className = "resolution-data";
            title.textContent = `Ticket #${ticket.id} — ${ticket.titolo || "Senza titolo"}`;
            data.append(
                createField("Stato", ticket.stato.replaceAll("_", " ")),
                createField("Data di apertura", formatDate(ticket.created_at)),
                createField("Data di risoluzione", finished ? formatDate(ticket.updated_at) : "In lavorazione"),
                createField("Tempo", `${daysBetween(ticket.created_at, end).toFixed(1)} giorni`)
            );
            card.append(title, data);
            resolutionList.appendChild(card);
        });
    } catch (error) {
        message.textContent = error.message;
        message.className = "form-message error-message";
    }
}

loadResolutionTimes();
