const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDirectory = path.join(
    __dirname,
    "../uploads/documenti"
);

fs.mkdirSync(uploadDirectory, {
    recursive: true
});

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        const nomeSicuro =
            `${Date.now()}-${crypto.randomUUID()}.pdf`;

        callback(null, nomeSicuro);
    }
});

function pdfFilter(req, file, callback) {
    const estensione =
        path.extname(file.originalname).toLowerCase();

    if (
        file.mimetype !== "application/pdf" ||
        estensione !== ".pdf"
    ) {
        return callback(
            new Error(
                "È possibile caricare esclusivamente documenti PDF"
            )
        );
    }

    callback(null, true);
}

const uploadDocument = multer({
    storage,
    fileFilter: pdfFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = uploadDocument;