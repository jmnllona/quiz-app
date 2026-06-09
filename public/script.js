import Api from "./service/ApiCall.js";

// ══════════════════════════════════════════════════════════════════════════════════
//                   STATE
// ══════════════════════════════════════════════════════════════════════════════════

let state = {
  // quiz (player side)
  categories: [],
  selectedCategory: null,
  questions: [],
  currentQuestion: 0,
  qCount: 0,
  timerSeconds: 10,
  correctScore: 0,
  mistakes: 0,

  // admin side
  adminLoggedIn: false,
  admin_categories: [],
  admin_questions: [],
};

// ══════════════════════════════════════════════════════════════════════════════════
//                   SCREEN NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════════

showToast("They call me a hero, because i saved my nation from falling apart", "toast-success")


/** Hides all screens and shows the one matching `screenName` */
function switchScreenTo(screenName) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });

  const id = screenName + "-screen";
  const screen = document.getElementById(id);

  if (screen) {
    // Admin screen gets a different header color
    if (id === "admin-screen") {
      document.getElementById("header").style.backgroundColor = "var(--darkgrey)";
    } else {
      document.getElementById("header").style.backgroundColor = "";
    }

    screen.classList.add("active");
  }
}

/** Navigates back to the home screen */
function goHome() {
  switchScreenTo("home");
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════════

/** Switches to the category screen and fetches categories from API */
async function showCategories() {
  switchScreenTo("category");
  const el = document.getElementById("category-grid");

  const res = await Api.getCategories();
  state.categories = res.data;

  if (!res.success) {
    el.innerHTML = res.message;
    return;
  }

  el.innerHTML = "";
  renderCategories(state.categories);
}

/** Renders category cards into the category grid */
function renderCategories(c) {
  const el = document.getElementById("category-grid");

  if (c.length == 0) {
    el.innerHTML = "<p style='margin-top: 200px;'>🔍 No matching categories</p>";
    return;
  }

  // Static metadata (images and descriptions) matched by category id
  const details = [
    { id: 1, img: "./img/cat/icon/math-icon.svg", des: "math is the easiest subject fr" },
    { id: 2, img: "./img/cat/icon/science-icon.svg", des: "science is the....." },
    { id: 3, img: "./img/cat/icon/astronomy-icon.svg", des: "ill go to the other planet" },
    { id: 4, img: "./img/cat/icon/geography-icon.svg" },
    { id: 5, img: "./img/cat/icon/flag-icon.svg" },
    { id: 6, img: "./img/cat/icon/plants-icon.svg" },
  ];

  el.innerHTML = c
    .map((cat) => {
      const img = details.find(d => d.id == cat.id)?.img;
      const des = details.find(d => d.id == cat.id)?.des || "no description yet, the admin is being lazy";

      return `<button type="button" class="category-card-btn" data-id="${cat.id}">
                <img src="${img}" alt="icon" style="width: 50px; height: 50px;">
                <div style="display:flex; flex-direction:column; align-items:flex-start; gap: 5px;">
                  <h3>${cat.name}</h3>
                  <p>${des}</p>
                </div>
              </button>`;
    })
    .join("");
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   QUIZ FLOW
// ══════════════════════════════════════════════════════════════════════════════════

/** Starts a new quiz for the given category id */
async function startQuiz(catId) {
  switchScreenTo("quiz");
  resetQuizState();

  // Show a loading placeholder while fetching questions
  const el = document.querySelector(".question-card");
  el.innerHTML = `
    <div class="q-num" style="text-align: left">Q1</div>
    <div class="q-text">Loading...</div>
    <div class="opt-grid"></div>
  `;

  state.selectedCategory = state.categories.find((c) => c.id === catId);
  const res = await Api.getQuestions(state.selectedCategory.id, "medium");

  if (!res.success) {
    el.innerHTML = res.message;
    return;
  }

  // Only keep the fields we need
  state.questions = res.data.map(({ id, question, options, answer }) => {
    return { id, question, options, answer };
  });

  loadQuestion();
}

/** Resets all quiz-related state values */
function resetQuizState() {
  state.timerSeconds = 10;
  state.currentQuestion = 0;
  state.questions = [];
  state.correctScore = 0;
  state.mistakes = 0;
}

/** Loads and renders the current question, or shows results if done */
function loadQuestion() {
  // All questions answered — end the quiz
  if (state.currentQuestion >= state.questions.length) {
    Timer.stop();
    Timer.clear();
    showResults();
    return;
  }

  Timer.clear();

  const el = document.getElementById("quiz-screen");
  const q = state.questions[state.currentQuestion];

  // Update category tag, question number, and question text
  el.querySelector(".quiz-category-tag").innerHTML = state.selectedCategory.name;
  el.querySelector(".q-num").innerHTML = "Q" + (state.currentQuestion + 1);
  el.querySelector(".q-text").innerHTML = `<h1>${q.question}</h1>`;

  adjustFont();

  // Render answer option buttons
  el.querySelector(".opt-grid").innerHTML = q.options
    .map((op) => `<button class="btn opt-btn" value="${op}">${op}</button>`)
    .join("");

  console.log(state.correctScore);

  // Uncomment to enable auto-advance on timer expiry:
  // Timer.start(() => {
  //   state.currentQuestion++;
  //   loadQuestion();
  // });
}

/** Switches to the result screen and fills in the score */
function showResults() {
  switchScreenTo("result");
  document.getElementById("res-correct").textContent = state.correctScore;
  document.getElementById("res-mistakes").textContent = state.mistakes;
  document.getElementById("res-total").textContent = `📋 ${state.questions.length} Questions`;
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   TIMER  (IIFE module)
// ══════════════════════════════════════════════════════════════════════════════════

const Timer = (() => {
  const CIRCUMFERENCE = 126;

  let interval = null;
  let timeLeft = 0;

  const progressEl = document.querySelector(".timer-progress");
  const textEl = document.querySelector(".timer-text");

  /** Updates the SVG ring and text to reflect `timeLeft` */
  const updateUI = () => {
    const offset = CIRCUMFERENCE * (1 - timeLeft / state.timerSeconds);
    progressEl.style.strokeDashoffset = offset;
    textEl.textContent = timeLeft;

    // Color-code urgency
    progressEl.classList.remove("warning", "danger");
    if (timeLeft <= 3) progressEl.classList.add("danger");
    else if (timeLeft <= 7) progressEl.classList.add("warning");
  };

  /** Stops the interval without resetting the display */
  const stop = () => {
    clearInterval(interval);
    interval = null;
  };

  /** Stops and resets timeLeft back to the full duration */
  const reset = () => {
    stop();
    timeLeft = state.timerSeconds;
    updateUI();
  };

  /** Stops and visually empties the ring */
  const clear = () => {
    stop();
    timeLeft = 0;
    progressEl.style.strokeDashoffset = CIRCUMFERENCE;
    textEl.textContent = 0;
  };

  /** Starts the countdown; calls `onExpire` when it reaches 0 */
  const start = (onExpire) => {
    reset();
    interval = setInterval(() => {
      timeLeft--;
      updateUI();
      if (timeLeft <= 0) {
        stop();
        onExpire();
      }
    }, 1000);
  };

  return { start, stop, reset, clear };
})();

// ══════════════════════════════════════════════════════════════════════════════════
//                   ADMIN — AUTH
// ══════════════════════════════════════════════════════════════════════════════════

/** Verifies the admin password and unlocks the admin screen on success */
async function verifyPassword() {
  document.getElementById("admin-pass-input").value = "manchild123";

  const modal = document.getElementById("admin-modal");
  const p = document.getElementById("admin-pass-input");
  const err = document.getElementById("admin-pass-err");

  // Guard: empty input
  if (p.value.trim() == "") {
    err.textContent = "hey, you forgot to type a password 👀";
    err.classList.add("active");
    p.style.borderColor = "red";
    p.focus();
    return;
  }

  const res = await Api.verifyPassword(p.value.trim());

  if (res.success) {
    state.adminLoggedIn = true;
    document.getElementById("admin-btn").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline-block";
    modal.close();
    switchScreenTo("admin");

    // Load questions first (needed for counts), then categories, then render both
    getAdminQuestions()
      .then(() => getAdminCategories())
      .then(() => {
        renderCatFilter();
        loadAdminQuestions();
        loadAdminCategories();
      });



    return;
  }

  // Wrong password
  err.textContent = res.message;
  err.classList.add("active");
  p.style.borderColor = "red";
  p.focus();
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   ADMIN — DATA FETCHING
// ══════════════════════════════════════════════════════════════════════════════════

/** Fetches all questions and stores them in state */
async function getAdminQuestions() {
  const res = await Api.getAllQuestions();

  if (!res.success) {
    console.log("success: ", res.success, res.message);
    return;
  }

  console.log("success:", res.success, res.message);
  state.admin_questions = res.data;

}

/** Fetches all categories and stores them in state */
async function getAdminCategories() {
  const res = await Api.getCategories();

  if (!res.success) {
    console.log(res.success, res.message);
    return;
  }

  state.admin_categories = res.data;
  showToast(res.message, "toast-warning");
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   ADMIN — QUESTIONS TABLE
// ══════════════════════════════════════════════════════════════════════════════════

const letterArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/** Renders all admin questions (unfiltered) */
function loadAdminQuestions() {
  renderQuestions(state.admin_questions);
}

/** Renders a list of questions into the admin table */
function renderQuestions(questions) {
  const tbody = document.getElementById("question-tbody");

  if (questions.length === 0) {
    tbody.innerHTML = `<tr>
      <td colspan="6" style="text-align:center; color:#8b8b8b; padding: 30px;">
        no questions found
      </td>
    </tr>`;
    return;
  }

  tbody.innerHTML = questions.map((q, index) => {
    const cat = (state.admin_categories.find(c => c.id === q.category_id)?.name ?? "unknown")
      .toLowerCase()
      .replaceAll(" ", "-");

    const optionsHTML = q.options.map((opt, i) => {
      const isCorrect = opt === q.answer;
      return `<div class="opt ${isCorrect ? "correct" : ""}">
      <input class="radio"  style="display:none" type="radio" name="opt_radio">
        <span class="opt-letter" style="display: flex" >${letterArr[i]}</span>
        <input class=opt-text value="${opt}" disabled>
        <span class ="opt-checkmark">${isCorrect ? "🗸" : ""}</span>
      </div>`;
    }).join("");

    return `<tr>
      <td><span class="id" data-id="${q.id}">${q.id}</span></td>
      <td><span class="badge cat-${cat}">${cat}</span></td>
      <td><span class="badge diff-${q.difficulty}">${q.difficulty}</span></td>
      <td>${q.options.length} choices</td>
        <td> <input class="question-text" value="${"comming soon"}" disabled></td>
      <td class="td5" >
        <input class="question-text" value="${q.question}" disabled>
        <div class="opt-list">${optionsHTML}</div>
      </td>
      <td>
        <div style="position: relative; display: inline-block;" class="action-wrapper">
          <button class="action-btn"  aria-label="actions">...</button>
          <button class="save-btn" style="display: none" >save</button>
          <div class="action-popup" style="display: none">
            <div class="tip-wrap">
              <button class="edit-btn" aria-label="edit"><i class="ti ti-edit"></i></button>
              <span class="tip">edit</span>
            </div>
            <div class="tip-wrap">
              <button class="remove-btn" aria-label="remove"><i class="ti ti-trash"></i></button>
              <span class="tip">remove</span>
            </div>
          </div>
        </div>
      </td>
    </tr>`;
  }).join("");
}

/** Filters the question table by selected category and difficulty */
function filterRows() {
  const cat = document.getElementById('cat-filter').value;
  const diff = document.getElementById('diff-filter').value;

  const filtered = state.admin_questions.filter(q => {
    return (!cat || q.category_id == cat) && (!diff || q.difficulty === diff);
  });

  renderQuestions(filtered);
}


const confirmPopup = document.getElementById('confirm-del-popup');
const checkbox = document.getElementById('confirm-del-checkbox')
const confirmBtn = document.getElementById('confirm-del-confirm-btn');
const cancelBtn = document.getElementById('confirm-del-cancel-btn');


checkbox.addEventListener("change", (e) => {
  confirmBtn.disabled = !e.target.checked;
});

function confirmDel() {

  checkbox.checked = false;
  confirmBtn.disabled = true;

  return new Promise((resolve) => {

    confirmPopup.showModal();

    confirmBtn.onclick = () => { confirmPopup.close(); resolve(true); };
    cancelBtn.onclick = () => { confirmPopup.close(); resolve(false); };

  });
}

async function save(e) {

  const tr = e.target.closest("tr");
  const td = tr.querySelector(".td5");


  //check if correct answer is selected
  const checked = td.querySelector(`input[name="opt_radio"]:checked`);

  if (!checked) {
    console.log("please choose correct answer.\n");
  }
  else {
    const optField = checked.closest(".opt");
    //change css for highlighting correct answer 
    td.querySelector(".opt.correct").classList.remove("correct");
    optField.classList.add("correct");
    td.querySelectorAll(".opt-checkmark").forEach(s => s.textContent = "");
    optField.querySelector(".opt-checkmark").textContent = "🗸";

    //get and save data
    const fields = {
      question: td.querySelector(".question-text").value.trim(),
      options: Array.from(td.querySelectorAll(".opt-text")).map(opt => opt.value.trim()),
      answer: optField.querySelector(".opt-text").value.trim(),
    };
    //get question id 
    const id = tr.querySelector(".id").dataset.id;
    console.log(id);

    const res = await Api.updateQuestion(fields, id);
    if (!res.success) { console.log(res.message) }

    tbody.querySelectorAll(".action-btn").forEach(a => a.style.display = "flex");
    tbody.querySelectorAll(".save-btn").forEach(s => s.style.display = "none");


    tbody.querySelectorAll("input").forEach(i => i.disabled = true);
    tbody.querySelectorAll(".radio").forEach(r => r.style.display = "none");
    tbody.querySelectorAll(".opt-letter").forEach(l => l.style.display = "flex");

    console.log(res.message);
  }

}

// ══════════════════════════════════════════════════════════════════════════════════
//                   ADMIN — CATEGORIES TAB
// ══════════════════════════════════════════════════════════════════════════════════

/** Renders all admin categories (unfiltered) */
function loadAdminCategories() {
  renderAdminCategories(state.admin_categories);
}

/** Renders category cards in the admin categories panel */
function renderAdminCategories(categories) {
  const cbody = document.getElementById("admin-cat-wrapper");

  if (categories.length === 0) {
    cbody.innerHTML = `<div class="admin-cat-card empty-card">no category yet</div>`;
    return;
  }

  // Static metadata (images and descriptions) matched by category id
  const data = [
    { id: 1, img: "./img/cat/card img/math.webp", des: "math is the easiest subject frfr" },
    { id: 2, img: "./img/cat/card img/science.webp", des: "science is the....." },
    { id: 3, img: "./img/cat/card img/astronomy.webp", des: "ill go to the other planet" },
    { id: 4, img: "./img/cat/card img/geography.webp" },
    { id: 5, img: "./img/cat/card img/flags.webp" },
    { id: 6, img: "./img/cat/card img/animals.webp" },
  ];

  cbody.innerHTML = categories.map(c => {
    // Count how many questions belong to this category
    let count = 0;
    state.admin_questions.forEach(q => q.category_id == c.id ? count++ : '');

    const des = data.find(d => d.id == c.id)?.des ?? "no description yet";
    const img = data.find(d => d.id == c.id)?.img ?? "./img/default.img";

    return `<div class="admin-cat-card">
      <img class="cat-card-img" src="${img}"
        onerror="this.onerror=null; this.src='https://cdn1.vectorstock.com/i/thumb-large/65/30/default-image-icon-missing-picture-page-vector-40546530.jpg';">
      <div class="field-group">
        <span class="badge cat-${c.name.toLowerCase()}" style="width: fit-content; border-radius: 30px; font-size: 15px;">
          ${c.name}
        </span>
        <p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
          ${des} sdfjsdjf slkdfjskjdf lsdjfsj
        </p>
        <p style="color: var(--highlightgreen)"><span>${count}</span> questions</p>
      </div>
    </div>`;
  }).join("");
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   ADMIN — CATEGORY SELECTS
// ══════════════════════════════════════════════════════════════════════════════════

/**
 * Shared helper: populates a <select> element with category options.
 * `defaultSelect` is the first placeholder <option> HTML string.
 */
function renderCat(el, defaultSelect) {
  if (state.admin_categories.length == 0) return;

  el.innerHTML = defaultSelect;

  const options = state.admin_categories
    .map(d => `<option value="${d.id}">${d.name}</option>`)
    .join("");

  el.insertAdjacentHTML("beforeend", options);
}

/** Populates the category filter dropdown (shows "All categories" by default) */
function renderCatFilter() {
  const el = document.getElementById("cat-filter");
  renderCat(el, `<option value="">All categories</option>`);
}

/** Populates the add-question form's category dropdown */
function renderFormCat() {
  const el = document.getElementById("q-form-cat");
  renderCat(el, `<option value="" disabled selected>Select…</option>`);
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   ADMIN — ADD QUESTION FORM
// ══════════════════════════════════════════════════════════════════════════════════

/**
 * Validates the add-question form.
 * Returns a question object if valid, or null if any field is empty.
 */
function checkIsFormValid() {
  const fields = {
    q: document.getElementById("q-text"),
    optA: document.getElementById("opt-a"),
    optB: document.getElementById("opt-b"),
    optC: document.getElementById("opt-c"),
    optD: document.getElementById("opt-d"),
    answer: document.getElementById("q-answer"),
    diff: document.getElementById("q-diff"),
    cat: document.getElementById("q-form-cat"),
  };

  let isValid = true;

  // Clear previous error states
  document.querySelectorAll('.form-err').forEach(el => el.classList.remove('active'));

  // Highlight empty fields
  Object.values(fields).forEach(field => {
    if (field.value.trim() === "") {
      const err = field.closest('.field-group')?.querySelector('.form-err');
      err?.classList.add('active');

      const errText = document.getElementById("form-err-text");
      errText?.classList.add('active');

      isValid = false;
    }
  });

  if (!isValid) return null;

  // Resolve the actual answer text from the selected letter (e.g. "A" → opt-a's value)
  const answer = document.getElementById(`opt-${fields.answer.value.trim().toLowerCase()}`).value.trim();

  return {
    question: fields.q.value.trim(),
    options: [fields.optA.value.trim(), fields.optB.value.trim(), fields.optC.value.trim(), fields.optD.value.trim()],
    answer: answer,
    difficulty: fields.diff.value.trim(),
    category_id: fields.cat.value.trim(),
  };
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   ADMIN — TABS
// ══════════════════════════════════════════════════════════════════════════════════

/** Switches between admin tab panels (bound with `this`, used as event handler) */
function switchTab() {
  document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach((t) => t.classList.remove("active"));

  this.classList.add("active");

  const tab = document.getElementById(this.dataset.tab + "-tab");
  if (tab) tab.classList.add("active");
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   HELPERS
// ══════════════════════════════════════════════════════════════════════════════════

function refreshAdminQuestions() {
  getAdminQuestions()
    .then(() => { filterRows(); });

}

/**
 * Shrinks the question text font-size until it fits inside the card.
 * Guards against .q-text not existing yet (e.g. on initial page load).
 */
function adjustFont() {
  const el = document.querySelector(".question-card");
  const text = el.querySelector(".q-text");

  // BUG FIX: .q-text may not exist yet on page load — bail early
  if (!text) return;

  let fontSize = 20;
  text.style.fontSize = fontSize + "px";

  while (text.scrollHeight > text.clientHeight && fontSize > 10) {
    fontSize--;
    text.style.fontSize = fontSize + "px";
  }
}


function showToast(toastString = "Hello", accent) {

  const toast = document.getElementById("toast");


  toast.classList.add(`${accent}`);
  toast.classList.add("active");
  toast.textContent = toastString;


  setTimeout(() => {

    toast.classList.remove("active");
    setTimeout(() => {
      toast.classList.remove(`${accent}`);

    }, 300); // wait for 0.3s transition to finish

    toast.textContent = "";
  }, 3000);


}




// ══════════════════════════════════════════════════════════════════════════════════
//                   SVG ICONS
// ══════════════════════════════════════════════════════════════════════════════════

const open = `<svg class="eye-open" xmlns="http://www.w3.org/2000/svg"
  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
  <circle cx="12" cy="12" r="3" />
</svg>`;

const close = `<svg class="eye-close" xmlns="http://www.w3.org/2000/svg"
  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`;

// ══════════════════════════════════════════════════════════════════════════════════
//                   EVENT LISTENERS
// ══════════════════════════════════════════════════════════════════════════════════

// ── Header ──────────────────────────────────────────────────────────────────────

document.getElementById("header").addEventListener("click", (e) => {
  if (e.target.id === 'admin-btn') {
    document.getElementById("admin-modal").showModal();
  }
  if (e.target.id === "logout-btn") {
    e.target.style.display = "none";
    switchScreenTo("home");

    document.getElementById("admin-btn").style.display = "inline-block";
  }
});

// ── Home screen ─────────────────────────────────────────────────────────────────

document.getElementById("home-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-back")) goHome();
  else if (e.target.classList.contains("play")) showCategories();
});

// ── Category screen ─────────────────────────────────────────────────────────────

document.getElementById("category-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("back")) goHome();
  else if (e.target.classList.contains("retry")) showCategories();
  else {
    const card = e.target.closest(".category-card-btn");
    if (!card) return;
    startQuiz(Number(card.dataset.id));
  }
});

// Category search bar — filters rendered cards live
document.getElementById("category-searchBar").addEventListener("input", function () {
  const query = this.value.trim();
  const filtered = query === ""
    ? state.categories
    : state.categories.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

  renderCategories(filtered);
});

// ── Quiz screen ─────────────────────────────────────────────────────────────────

document.getElementById("quiz-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("back")) {
    goHome();
    Timer.stop();
    Timer.clear();
  } else if (e.target.classList.contains("retry")) {
    startQuiz(state.selectedCategory.id);
  } else if (e.target.classList.contains("goCat")) {
    showCategories();
  }

  // Answer selected
  if (e.target.classList.contains("opt-btn")) {
    if (state.questions[state.currentQuestion].answer == e.target.value) {
      state.correctScore++;
    } else {
      state.mistakes++;
    }

    Timer.stop();
    state.currentQuestion++;
    loadQuestion();
  }
});

// ── Result screen ────────────────────────────────────────────────────────────────

document.getElementById("result-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("back")) goHome();
  else if (e.target.classList.contains("retry")) startQuiz(state.selectedCategory.id);
  else if (e.target.classList.contains("goCat")) showCategories();
});

// ── Admin modal ──────────────────────────────────────────────────────────────────

const modal = document.getElementById("admin-modal");
const passInput = document.getElementById("admin-pass-input");

modal.addEventListener("click", (e) => {
  if (e.target.id === "admin-login-btn") verifyPassword();
  if (e.target.id === "admin-modal-close-btn") modal.close();

  // Toggle password visibility
  if (e.target.id === 'toggle-btn') {
    const isHidden = passInput.type == 'password';
    passInput.type = isHidden ? 'text' : 'password';
    e.target.innerHTML = isHidden ? open : close;
  }
});

// Submit password with Enter key
passInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); verifyPassword(); }
});

// ── Admin — tabs ─────────────────────────────────────────────────────────────────

document.querySelectorAll(".admin-tab").forEach(a => {
  a.addEventListener("click", switchTab);
});

// ── Admin — question filters ──────────────────────────────────────────────────────

['cat-filter', 'diff-filter'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    filterRows();
    window.scrollTo(document.getElementById("question-table"));
  });
});



// Open the form panel


document.getElementById('add-question-btn').addEventListener('click', (e) => {
  e.target.classList.remove('show');
  form.classList.add("active");
  renderFormCat();
  document.getElementById("admin-screen").classList.add("adjust");

  setTimeout(() => {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 8);
});


// ── Admin — add question form ─────────────────────────────────────────────────────

const form = document.getElementById('q-form');

// Form actions (cancel / add)
form.addEventListener("click", async (e) => {
  e.preventDefault();

  if (e.target.id === "q-form-cancel-btn") {
    e.currentTarget.classList.remove("active");
    document.getElementById("admin-screen").classList.remove("adjust");
    document.getElementById('add-question-btn').classList.add('show');
    form.reset();
    return;
  }

  if (e.target.closest("#q-form-btn-clearForm")) {
    form.reset();

  }

  if (e.target.id === "q-form-btn-add") {
    const q = checkIsFormValid();
    console.log(q);
    if (!q) return;

    await Api.addQuestion(q);

    // Refresh the questions table
    refreshAdminQuestions();
    form.reset();
  }
});

// ── Admin — question table actions ────────────────────────────────────────────────

const tbody = document.getElementById('question-tbody');

tbody.addEventListener('click', async e => {

  // Toggle the action popup (edit/remove buttons)
  if (e.target.closest('.action-btn')) {
    const popup = e.target.closest('.action-wrapper').querySelector('.action-popup');
    popup.style.display = popup.style.display === "none" ? 'flex' : 'none';
  }

  if (e.target.closest('.remove-btn')) {
    const id = Number(e.target.closest('tr').querySelector('.id').dataset.id);
    if (!id) return;

    confirmDel().then(async (confirmed) => {

      if (confirmed) {

        const res = await Api.deleteQuestion(id);
        refreshAdminQuestions();
        console.log("success: ", res.success, res.message);


      }
    })
  }

  if (e.target.closest(".edit-btn")) {
    tbody.querySelectorAll(".action-btn").forEach(a => a.style.display = "flex");
    tbody.querySelectorAll(".save-btn").forEach(s => s.style.display = "none");

    e.target.closest("td").querySelector(".save-btn").style.display = "flex";
    e.target.closest(".action-popup").style.display = "none";
    e.target.closest("td").querySelector(".action-btn").style.display = "none";

    tbody.querySelectorAll("input").forEach(i => i.disabled = true);
    tbody.querySelectorAll(".radio").forEach(r => r.style.display = "none");
    tbody.querySelectorAll(".opt-letter").forEach(l => l.style.display = "flex");

    e.target.closest("tr").querySelectorAll("input").forEach(i => i.disabled = false);
    const td = e.target.closest("tr").querySelector(".td5");
    td.querySelectorAll(".radio").forEach(r => r.style.display = "flex");
    td.querySelectorAll(".opt-letter").forEach(r => r.style.display = "none");
  }

  if (e.target.closest(".save-btn")) {

    save(e);

  }
});

// ── Admin — tooltip hover ─────────────────────────────────────────────────────────

tbody.addEventListener('mouseover', e => {
  const wrap = e.target.closest('.tip-wrap');
  if (wrap) wrap.querySelector('.tip').style.opacity = '1';
});

tbody.addEventListener('mouseout', e => {
  // Hide tooltip when leaving the button
  if (e.target.classList.contains("remove-btn") || e.target.classList.contains("edit-btn")) {
    const wrap = e.target.closest('.tip-wrap');
    if (wrap) wrap.querySelector('.tip').style.opacity = '0';
  }

  // Hide action popup when cursor leaves it entirely
  if (e.target.classList.contains("action-popup")) {
    if (!e.target.contains(e.relatedTarget)) {
      e.target.style.display = "none";
    }
  }

  if (e.target.classList.contains("td5")) {



  }



});

tbody.addEventListener('change', async (e) => {

  const tr = e.target.closest("tr");
  const td = tr.querySelector(".td5");


  //check if correct answer is selected
  const checked = td.querySelector(`input[name="opt_radio"]:checked`);

  if (checked) {

    const optField = checked.closest(".opt");
    //change css for highlighting correct answer 
    td.querySelector(".opt.correct").classList.remove("correct");
    optField.classList.add("correct");
    td.querySelectorAll(".opt-checkmark").forEach(s => s.textContent = "");
    optField.querySelector(".opt-checkmark").textContent = "🗸";



  }

});


