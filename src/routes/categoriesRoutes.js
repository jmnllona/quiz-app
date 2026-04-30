const express = require("express");

const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategoryName,
} = require("../controllers/categoryControllers");

router = express.Router();
router.get("/", getCategories);
router.post("/", addCategory);
router.put("/:id", updateCategoryName);
router.delete("/:id", deleteCategory);

module.exports = router;
