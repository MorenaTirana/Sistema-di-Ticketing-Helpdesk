const express = require("express");

const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
} = require("../controllers/knowledgeBaseController");

const {
    requireAuth,
    requireOperator
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, getArticles);
router.get("/:id", requireAuth, getArticleById);
router.post("/", requireOperator, createArticle);
router.patch("/:id", requireOperator, updateArticle);
router.delete("/:id", requireOperator, deleteArticle);

module.exports = router;
