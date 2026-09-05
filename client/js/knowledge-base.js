function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

function escapeHtml(testo) {
    const contenitore = document.createElement("div");

    contenitore.textContent = testo;

    return contenitore.innerHTML;
}

const newArticleSection =
    document.getElementById("newArticleSection");

const showNewArticleButton =
    document.getElementById("showNewArticleButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const articleForm =
    document.getElementById("articleForm");

const articleFormTitle =
    document.getElementById("articleFormTitle");

const articleFormMessage =
    document.getElementById("articleFormMessage");

const articleTitle =
    document.getElementById("articleTitle");

const articleCategory =
    document.getElementById("articleCategory");

const articleContent =
    document.getElementById("articleContent");

const articlePublished =
    document.getElementById("articlePublished");

const articlesMessage =
    document.getElementById("articlesMessage");

const articlesList =
    document.getElementById("articlesList");

let currentUser = null;
let editingArticleId = null;

function formatDate(valore) {
    return new Date(valore).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function resetArticleForm() {
    editingArticleId = null;
    articleForm.reset();
    articleFormTitle.textContent = "Nuovo articolo";
    cancelEditButton.hidden = true;
    articlePublished.checked = true;
}

async function loadArticles() {
    articlesMessage.textContent = "";

    try {
        const response = await fetch("/api/knowledge-base");
        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(
                risultato.message ||
                "Impossibile caricare gli articoli"
            );
        }

        const articoli = Array.isArray(risultato.articoli)
            ? risultato.articoli
            : [];

        if (articoli.length === 0) {
            articlesList.innerHTML = `
                <p class="empty-message">
                    Nessun articolo disponibile al momento.
                </p>
            `;
            return;
        }

        articlesList.innerHTML = articoli
            .map((articolo) => {
                const bozza =
                    !articolo.pubblicato
                        ? '<span class="warranty-badge warranty-unknown">Bozza</span>'
                        : "";

                const categoria = articolo.categoria
                    ? `<p><strong>Categoria:</strong> ${escapeHtml(articolo.categoria)}</p>`
                    : "";

                const azioniOperatore =
                    currentUser &&
                    currentUser.ruolo === "operatore"
                        ? `
                            <div class="boat-form-actions">
                                <button
                                    class="button button-small edit-article-button"
                                    type="button"
                                    data-id="${articolo.id}"
                                >
                                    Modifica
                                </button>
                                <button
                                    class="button button-small delete-article-button"
                                    type="button"
                                    data-id="${articolo.id}"
                                >
                                    Elimina
                                </button>
                            </div>
                        `
                        : "";

                return `
                    <article class="boat-card">
                        <div class="boat-card-header">
                            <h3>${escapeHtml(articolo.titolo)}</h3>
                            ${bozza}
                        </div>

                        <div class="boat-details">
                            ${categoria}
                            <p>${escapeHtml(articolo.contenuto)}</p>
                            <p><strong>Aggiornato il:</strong> ${formatDate(articolo.updated_at)}</p>
                        </div>

                        ${azioniOperatore}
                    </article>
                `;
            })
            .join("");
    } catch (error) {
        articlesList.innerHTML = "";

        articlesMessage.textContent = messaggioErrore(error);
        articlesMessage.className = "form-message error-message";
    }
}

async function initPage() {
    try {
        const response = await fetch("/api/auth/me");
        const risultato = await response.json();

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

        currentUser = risultato.utente;

        if (currentUser.ruolo === "operatore") {
            showNewArticleButton.hidden = false;
        }

        await loadArticles();
    } catch (error) {
        articlesMessage.textContent = messaggioErrore(error);
        articlesMessage.className = "form-message error-message";
    }
}

showNewArticleButton.addEventListener("click", () => {
    resetArticleForm();
    newArticleSection.hidden = false;
    articleTitle.focus();
});

cancelEditButton.addEventListener("click", () => {
    resetArticleForm();
    newArticleSection.hidden = true;
});

articleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    articleFormMessage.textContent = "Salvataggio in corso...";
    articleFormMessage.className = "form-message";

    const datiArticolo = {
        titolo: articleTitle.value.trim(),
        categoria: articleCategory.value.trim(),
        contenuto: articleContent.value.trim(),
        pubblicato: articlePublished.checked
    };

    const url = editingArticleId
        ? `/api/knowledge-base/${editingArticleId}`
        : "/api/knowledge-base";

    const method = editingArticleId ? "PATCH" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datiArticolo)
        });

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        articleFormMessage.textContent = risultato.message;
        articleFormMessage.className = "form-message success-message";

        resetArticleForm();
        newArticleSection.hidden = true;

        await loadArticles();
    } catch (error) {
        articleFormMessage.textContent = messaggioErrore(error);
        articleFormMessage.className = "form-message error-message";
    }
});

articlesList.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".edit-article-button");
    const deleteButton = event.target.closest(".delete-article-button");

    if (editButton) {
        const articleId = editButton.dataset.id;

        try {
            const response = await fetch(`/api/knowledge-base/${articleId}`);
            const risultato = await response.json();

            if (!response.ok) {
                throw new Error(risultato.message);
            }

            editingArticleId = risultato.articolo.id;
            articleTitle.value = risultato.articolo.titolo;
            articleCategory.value = risultato.articolo.categoria || "";
            articleContent.value = risultato.articolo.contenuto;
            articlePublished.checked = Boolean(risultato.articolo.pubblicato);

            articleFormTitle.textContent = "Modifica articolo";
            cancelEditButton.hidden = false;
            newArticleSection.hidden = false;
            articleTitle.focus();
        } catch (error) {
            articlesMessage.textContent = messaggioErrore(error);
            articlesMessage.className = "form-message error-message";
        }
    }

    if (deleteButton) {
        const articleId = deleteButton.dataset.id;

        const conferma = window.confirm(
            "Eliminare definitivamente questo articolo?"
        );

        if (!conferma) {
            return;
        }

        try {
            const response = await fetch(
                `/api/knowledge-base/${articleId}`,
                { method: "DELETE" }
            );

            const risultato = await response.json();

            if (!response.ok) {
                throw new Error(risultato.message);
            }

            await loadArticles();
        } catch (error) {
            articlesMessage.textContent = messaggioErrore(error);
            articlesMessage.className = "form-message error-message";
        }
    }
});

initPage();
