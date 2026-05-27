const db = require("../db");

const Err = {
  serverErr: `<div class="error-state">
              <h3>💥 Something went wrong</h3>
              <p>The server ran into a problem. This is on our end, not yours.</p>
              <br><button class="btn retry">Retry</button>
              </div>`,
  emptyErr: `<div class="error-state">
             <h3>🔍 No Questions Found</h3>
             <p>There are no questions for this category yet.</p>
             <br><button class="btn btn--primary size--long goCat">Try Different Category </button>
             </div>`,
  emptyTableErr: `<div class="error-state">
             <h3>🔍 No Questions Found</h3>
             <p>There are no questions yet.</p>
             </div>`,
  notFounErr: (id) =>
    `<div class="error-state">
             <h3>🔍 No Matching Questions Found</h3>
             <p>There are no matching question with ${id}.</p>
             </div>`,

};

const addQuestion = async (req, res) => {
  try {
    const q = req.body;

    await db.query(
      `INSERT INTO questions(question, options, answer, difficulty, category_id) VALUES ($1, $2, $3, $4, $5)`,
      [q.question, q.options, q.answer, q.difficulty, q.category_id],
    );

    res.json({
      success: true,
      message: `question added!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: Err.serverErr,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const { question, options, answer } = req.body;

    const result = await db.query(
      `UPDATE questions SET question =$1, options = $2 , answer = $3 WHERE id = $4 RETURNING *`,
      [question, options, answer, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: Err.notFounErr(id),
      });
    }

    res.json({
      success: true,
      message: `updated question with id: ${id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: Err.serverErr,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(`DELETE FROM questions WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: Err.notFounErr(id),
      });
    }

    res.json({
      success: true,
      message: `deleted question with id: ${id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "there is an error somewhere...Internal Server Error",
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { difficulty } = req.query;
    const result = await db.query(
      `SELECT * FROM questions WHERE category_id = $1 AND difficulty = $2`,
      [id, difficulty],
    );

    if (result.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: Err.emptyErr,
      });
    }

    res.json({
      success: true,
      message: "Question fetched",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: Err.serverErr,
    });
  }
};


const getAllQuestions = async (req, res) => {
  try {

    const result = await db.query(`SELECT * FROM questions ORDER BY id ASC`);

    if (result.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: Err.emptyTableErr,
      });
    }

    console.log(res.rows);

    res.json({
      success: true,
      message: "Question fetched",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: Err.serverErr,
    });
  }
};

module.exports = { addQuestion, updateQuestion, getQuestions, deleteQuestion, getAllQuestions };
