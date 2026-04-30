const express = require("express");

const {
  addQuestion,
  updateQuestion,
  getQuestions,
  deleteQuestion,
  getAllQuestions,
} = require("../controllers/questionsControllers");
const router = express.Router();

router.post("/", addQuestion);
router.put("/:id", updateQuestion);
router.get("/:id", getQuestions);
router.delete("/:id", deleteQuestion);
router.get("/", getAllQuestions);

module.exports = router;
