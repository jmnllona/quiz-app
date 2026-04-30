

const err = {
  message: `<div class="error-state" style="margin:auto;">
    <h3>⚠️ Could not get categories</h3>
    <p>Make sure your backend is running at <code>$CONFIG.BASE_URL}</code></p>
    <br><button class="btn retry" >Retry</button>
  </div>` ,
  message2: `<div class="error-state" style="margin:auto;">
    <h3>⚠️ Could not get questions</h3>
    <p>Make sure your backend is running at <code>$CONFIG.BASE_URL}</code></p>
    <br><button class="btn retry" >Retry</button>
  </div>`


}



// CATEGORIES  _____________________________________________________

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

// QUIZ  _____________________________________________________

const getQuestions = async (catId, difficulty) => {
  try {
    const res = await fetch(`/questions/${catId}?difficulty=${difficulty}`);

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
    }

  } catch (e) {
    return {
      success: false,
      message: err.message2,
    };
  }
};


const getAllQuestions = async (catId, difficulty) => {
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

export default { getCategories, updateCategoryName, getQuestions, getAllQuestions };
