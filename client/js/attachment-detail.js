const parametri =
    new URLSearchParams(window.location.search);

const ticketId =
    Number(parametri.get("ticket_id"));

const attachmentId =
    Number(parametri.get("attachment_id"));

const attachmentName =
    document.getElementById("attachmentName");

const attachmentMessage =
    document.getElementById("attachmentMessage");

const attachmentActions =
    document.getElementById("attachmentActions");

const viewAttachmentButton =
    document.getElementById("viewAttachmentButton");

const downloadAttachmentButton =
    document.getElementById("downloadAttachmentButton");

const deleteAttachmentButton =
    document.getElementById("deleteAttachmentButton");

const backToTicket =
    document.getElementById("backToTicket");

async function loadAttachment() {
    if (
        !Number.isInteger(ticketId) ||
        !Number.isInteger(attachmentId)
    ) {
        attachmentMessage.textContent =
            "Documento non valido";

        attachmentMessage.className =
            "form-message error-message";

        return;
    }

    backToTicket.href =
        `ticket-detail.html?id=${ticketId}`;

    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/attachments`
        );

        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const allegato = risultato.allegati.find(
            (elemento) =>
                Number(elemento.id) === attachmentId
        );

        if (!allegato) {
            throw new Error(
                "Documento non trovato"
            );
        }

        const url =
            `/api/tickets/attachments/${attachmentId}/view`;

        attachmentName.textContent =
            allegato.nome_file_originale;

        viewAttachmentButton.href = url;
        downloadAttachmentButton.href = url;

        downloadAttachmentButton.setAttribute(
            "download",
            allegato.nome_file_originale
        );

        deleteAttachmentButton.hidden =
            !allegato.eliminabile;

        attachmentActions.hidden = false;
    } catch (error) {
        attachmentMessage.textContent =
            error.message;

        attachmentMessage.className =
            "form-message error-message";
    }
}

deleteAttachmentButton.addEventListener(
    "click",
    async () => {
        const conferma = window.confirm(
            "Vuoi eliminare questo documento?"
        );

        if (!conferma) {
            return;
        }

        deleteAttachmentButton.disabled = true;

        try {
            const response = await fetch(
                `/api/tickets/attachments/${attachmentId}`,
                {
                    method: "DELETE"
                }
            );

            const risultato = await response.json();

            if (!response.ok) {
                throw new Error(risultato.message);
            }

            window.location.href =
                `ticket-detail.html?id=${ticketId}`;
        } catch (error) {
            attachmentMessage.textContent =
                error.message;

            attachmentMessage.className =
                "form-message error-message";

            deleteAttachmentButton.disabled = false;
        }
    }
);

loadAttachment();