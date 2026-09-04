const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDirectory = path.join(
    __dirname,
    "../uploads/ticket-allegati"
);

fs.mkdirSync(uploadDirectory, {
    recursive: true
});

const tipiConsentiti = new Map([
    ["image/jpeg", [".jpg", ".jpeg"]],
    ["image/png", [".png"]],
    ["image/webp", [".webp"]],
    ["image/heic", [".heic"]],
    ["image/heif", [".heif"]],

    ["video/mp4", [".mp4"]],
    ["video/quicktime", [".mov"]],
    ["video/webm", [".webm"]],

    ["application/pdf", [".pdf"]],

    ["application/msword", [".doc"]],
    [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".docx"]
    ],

    ["application/vnd.ms-excel", [".xls"]],
    [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        [".xlsx"]
    ],

    ["application/vnd.ms-powerpoint", [".ppt"]],
    [
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        [".pptx"]
    ],

    ["text/plain", [".txt"]],
    ["text/csv", [".csv"]],
    ["application/rtf", [".rtf"]],
    ["text/rtf", [".rtf"]],

    ["application/zip", [".zip"]],
    ["application/x-zip-compressed", [".zip"]]
]);

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        const estensione =
            path.extname(file.originalname).toLowerCase();

        const nomeSicuro =
            `${Date.now()}-${crypto.randomUUID()}${estensione}`;

        callback(null, nomeSicuro);
    }
});

function attachmentFilter(req, file, callback) {
    const estensione =
        path.extname(file.originalname).toLowerCase();

    const estensioniDelMime =
        tipiConsentiti.get(file.mimetype);

    if (
        !estensioniDelMime ||
        !estensioniDelMime.includes(estensione)
    ) {
        return callback(
            new Error(
                "Formato del file non consentito."
            )
        );
    }

    callback(null, true);
}

const uploadTicketAttachments = multer({
    storage,
    fileFilter: attachmentFilter,

    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 8
    }
});

module.exports = uploadTicketAttachments;