

const err = {
  message: `<div class="error-state" style="margin:auto;">
    <h3>⚠️ Could not get categories</h3>
   </div>` ,
  message2: `<div class="error-state" style="margin:auto;">
    <h3>⚠️ Could not get questions</h3>
   </div>`,
  addErr: `<div class="error-state" style="margin:auto;">
    <h3>⚠️ Could not add question</h3>
    </div>`,

  delErr: `<div class="error-state" style="margin:auto;">
    <h3>⚠️ Could not delete questions</h3>
     </div>`,

  editErr: `<div class="error-state" style="margin:auto;">
    <h3>⚠️ Could not update questions</h3>
     </div>`,

}



// CATEGORIES  __________________________________________________________________________________________________________

const getCategories = async () => {
  try {
    const res = await fetch("/categories/");

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message
      };
    }
    return {
      success: true,
      message: data.message,
      data: data.data
    };

    return;
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: err.message,
    };
  }
};

const updateCategoryName = async (id, name) => {
  try {
    const res = await fetch(`/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message
      };
    }

    return {
      success: true,
      message: data.message

    };
  } catch (e) {
    return {
      success: false,
      message: err.message
    };
  }
};

// Quesion  __________________________________________________________________________________________________________

const getQuestions = async (catId, difficulty) => {
  try {
    const res = await fetch(`/questions/${catId}?difficulty=${difficulty}`);

    const data = await res.json();


    if (!res.ok) {
      console.log(res.status)
      return {
        success: false,
        message: data.message
      };
    }

    return data;

  } catch (e) {
    return {
      success: false,
      message: err.message2,
    };
  }
};


const getAllQuestions = async () => {
  try {
    const res = await fetch(`/questions/`);

    const data = await res.json();

    return data;

  } catch (e) {
    return {
      success: false,
      message: err.message2,
    };
  }
};


const addQuestion = async (q) => {
  try {
    const res = await fetch(`/questions/`, {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q.question,
        options: q.options,
        answer: q.answer,
        difficulty: q.difficulty,
        category_id: q.category_id

      })
    });

    const data = await res.json();

    return data;

  } catch (e) {
    return {
      success: false,
      message: err.addErr,
    };
  }
};

// admin login  __________________________________________________________________________________________________________

const verifyPassword = async (p) => {

  try {
    const res = await fetch('/admin/login/', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: p })
    });

    const data = await res.json();

    return data;


  } catch (e) {

    return {
      success: false,
      message: err.message2,
    };

  }


}

const deleteQuestion = async (id) => {

  try {
    const res = await fetch(`/questions/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message
      };
    }
    return data;

  } catch (e) {

    console.error(`Make sure your backend is running at ${CONFIG.BASE_URL}`, e);

    return {
      success: false,
      message: err.delErr,
    }

  }
}


const updateQuestion = async (field, id) => {
  try {
    const res = await fetch(`/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field),

    });

    const data = await res.json();
    return data;
  }

  catch (e) {

    return {
      success: false,
      message: err.editErr,
    }
  }
}
export default {
  getCategories,
  updateCategoryName,
  getQuestions,
  getAllQuestions,
  verifyPassword,
  addQuestion,
  deleteQuestion,
  updateQuestion,
};
