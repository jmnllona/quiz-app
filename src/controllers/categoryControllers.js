const db = require("../db");

const addCategory = async (req, res) => {
  try {
    const name = req.name;

    await db.query(`INSERT INTO categories(name) VALUES ($1)`, [name]);

    res.json({
      success: true,
      message: `category added!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "there is an error somewhere...Internal Server Error",
    });
  }
};

const updateCategoryName = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;

    const result = await db.query(
      `UPDATE categories SET name =$1 WHERE id = $2 `,
      [name, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "category not found",
      });
    }

    res.json({
      success: true,
      message: `updated category name with id: ${id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "there is an error somewhere...Internal Server Error",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(`DELETE FROM categories WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      message: `deleted category with id: ${id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "there is an error somewhere...Internal Server Error",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM categories`);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Table Empty",
      });
    }

    res.json({
      success: true,
      message: "go pickachu",
      data: result.rows,
    });
  } catch (err) {
    // console.error(err);
    res.status(500).json({
      success: false,
      message: "there is an error somewhere...Internal Server Error",
    });
  }
};

module.exports = {
  addCategory,
  updateCategoryName,
  getCategories,
  deleteCategory,
};
