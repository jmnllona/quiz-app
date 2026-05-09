import Api from "./service/ApiCall.js";


const adminPassword = "jerald";

let state = {
  categories: [],
  selectedCategory: null,
  questions: [],
  currentQuestion: 0,
  qCount: 0,
  timerSeconds: 10,
  correctScore: 0,
  mistakes: 0,
  adminLoggedIn: false

};

function switchScreenTo(screenName) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });

  const id = screenName + "-screen";

  let screen = document.getElementById(id);
  if (screen) {
    if (id === "admin-screen") document.getElementById("header").style.backgroundColor = "#4b4b51";
    else document.getElementById("header").style.backgroundColor = "#7a87a0;";

    screen.classList.add("active");
  }
}

function goHome() {
  switchScreenTo("home");
}

// ══════════════════════════════════════════════════════════════════════════════════
//                   CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════════

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

function renderCategories(c) {
  const el = document.getElementById("category-grid");

  if (c.length == 0) { el.innerHTML = "<p style='margin-top: 200px;'>🔍 No matching categories</p>"; return; }


  const details = [
    { id: 1, img: "./img/math-icon.svg", des: "math is the easiest subject fr" },
    { id: 2, img: "./img/science-icon.svg", des: "science is the....." },
    { id: 3, img: "./img/astronomy-icon.svg", des: "ill go to the other planet" },
    { id: 4, img: "./img/geography-icon.svg" },
    { id: 5, img: "./img/flag-icon.svg" },
    { id: 6, img: "./img/plants-icon.svg" },
  ]

  el.innerHTML = c
    .map((cat) => {
      const img = details.find(d => (d.id == cat.id))?.img;
      const des = details.find(d => d.id == cat.id)?.des || " no description yet, the admin is being lazy";
      return `<button type="button" class="category-card-btn" data-id="${cat.id}">
              <img src="${img}" alt="icon" style="width: 50px; height: 50px;">
                <div style="display:flex; flex-direction:column; align-items:flex-start; gap: 5px; "><h3>${cat.name}</h3><p>${des}</p></div></button>`;
    })
    .join("");
}
// ══════════════════════════════════════════════════════════════════════════════════
//                   QUIZ FLOW
// ══════════════════════════════════════════════════════════════════════════════════

async function startQuiz(catId) {
  switchScreenTo("quiz");
  resetQuizState();

  const el = document.querySelector(".question-card");
  el.innerHTML = ` <div class="q-num" style="text-align: left">Q1</div>
                   <div class="q-text" >Loading...</div>
                    <div class="opt-grid"></div>`


  state.selectedCategory = state.categories.find((c) => c.id === catId);
  const res = await Api.getQuestions(state.selectedCategory.id, "medium");


  if (!res.success) {
    el.innerHTML = res.message;
    return;
  }

  state.questions = res.data.map(({ id, question, options, answer }) => {
    return { id, question, options, answer };
  });




  loadQuestion();
}

function resetQuizState() {

  state.timerSeconds = 10;
  state.currentQuestion = 0;
  state.questions = [];
  state.correctScore = 0;
  state.mistakes = 0;


}




function loadQuestion() {
  if (state.currentQuestion >= state.questions.length) {
    Timer.stop();
    Timer.clear();

    showResults();
    return;
  }
  Timer.clear();

  const el = document.getElementById("quiz-screen");


  const q = state.questions[state.currentQuestion];

  el.querySelector(".quiz-category-tag").innerHTML = state.selectedCategory.name;

  el.querySelector(".q-num").innerHTML = "Q" + eval(state.currentQuestion + 1);
  el.querySelector(".q-text").innerHTML = `<h1>${q.question}</h1 > `;
  adjustFont();

  el.querySelector(".opt-grid").innerHTML = q.options.map((op, i) => (`<button class="btn opt-btn" value = "${op}" > ${op}</button > `)).join("")
  console.log(state.correctScore);

  // Timer.start(() => {
  //   state.currentQuestion++;
  //   loadQuestion();

  // })
}

function showResults() {
  switchScreenTo("result");
  document.getElementById("res-correct").textContent = state.correctScore;
  document.getElementById("res-mistakes").textContent = state.mistakes;
  document.getElementById("res-total").textContent = `📋 ${state.questions.length} Questions`

}



const Timer = (() => {
  const CIRCUMFERENCE = 126

  let interval = null
  let timeLeft = 0

  const progressEl = document.querySelector(".timer-progress")
  const textEl = document.querySelector(".timer-text")

  const updateUI = () => {
    const offset = CIRCUMFERENCE * (1 - timeLeft / state.timerSeconds)  // ← read live
    progressEl.style.strokeDashoffset = offset
    textEl.textContent = timeLeft
    progressEl.classList.remove("warning", "danger")
    if (timeLeft <= 3) progressEl.classList.add("danger")
    else if (timeLeft <= 7) progressEl.classList.add("warning")
  }

  const stop = () => {
    clearInterval(interval)
    interval = null
  }

  const reset = () => {
    stop()
    timeLeft = state.timerSeconds  // ← read live
    updateUI()
  }
  const clear = () => {
    stop()
    timeLeft = 0  // ← sets to 0
    progressEl.style.strokeDashoffset = CIRCUMFERENCE  // ← empties the ring
    textEl.textContent = 0
  }

  const start = (onExpire) => {
    reset()
    interval = setInterval(() => {
      timeLeft--
      updateUI()
      if (timeLeft <= 0) {
        stop()
        onExpire()
      }
    }, 1000)
  }

  return { start, stop, reset, clear }
})()

// ══════════════════════════════════════════════════════════════════════════════════
//                    ADMIN 
// ══════════════════════════════════════════════════════════════════════════════════



function switchTab() {
  document.querySelectorAll(".admin-tab").forEach((t) => { t.classList.remove("active"); });
  document.querySelectorAll(".tab-panel").forEach((t) => { t.classList.remove("active"); });

  this.classList.add("active");
  const tabname = this.dataset.tab;


  let tab = document.getElementById(tabname + "-tab");
  if (tab) {
    tab.classList.add("active");

  }
}

function renderCat(el, defaultSelect) {
  if (state.categories.length == 0) return;

  el.innerHTML = defaultSelect;

  const options = state.categories.map(d => (`<option value="${d.id}">${d.name}</option>`)).join("");
  el.insertAdjacentHTML("beforeend", options);

}

function renderCatFilter() {

  const el = document.getElementById("cat-filter");
  const d = `<option value="">All categories</option>`;
  renderCat(el, d);

}


function renderFormCat() {

  const el = document.getElementById("q-form-cat");
  const d = ` <option value="" disabled selected>Select…</option>`;
  renderCat(el, d);

}


async function verifyPassword() {
  const modal = document.getElementById("admin-modal");
  const p = document.getElementById("admin-pass-input");
  const err = document.getElementById("admin-pass-err");


  if (p.value.trim() == "") {
    err.textContent = "hey, you forgot to type a password 👀";
    err.classList.add("active");
    p.style.borderColor = "red";
    p.focus();
    return;

  }

  const res = await Api.verifyPassword(p.value.trim());

  console.log(res);

  if (res.success) {
    state.adminLoggedIn = true;
    modal.close();
    switchScreenTo("admin");
    getAdminQuestions()
      .then(() => getAdminCategories())
      .then(() => { renderCatFilter(); loadAdminQuestions() });


    return;

  }

  else {
    err.textContent = res.message;
    err.classList.add("active");
    p.style.borderColor = "red";
    p.focus();

  }

}


async function getAdminQuestions() {

  const res = await Api.getAllQuestions();
  if (!res.success) {
    console.log(res.success, res.message)
    // el.innerHTML = res.message;
    return;
  }
  console.log(res.success, res.message)
  state.questions = res.data;
  console.log(state.questions);

}

async function getAdminCategories() {

  const res2 = await Api.getCategories();
  if (!res2.success) {
    console.log(res2.success, res2.message)
    // el.innerHTML = res.message;
    return;
  }

  state.categories = res2.data;
  console.log(state.categories);
}

const letterArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G',];

function loadAdminQuestions() {
  renderQuestions(state.questions);
}

function renderQuestions(questions) {
  let tbody = document.getElementById("question-tbody");

  if (questions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#8b8b8b; padding: 30px;">no questions found</td></tr>`;
    return;
  }

  tbody.innerHTML = questions.map(q => {
    const cat = (state.categories.find(c => c.id === q.category_id)?.name ?? "unknown").toLowerCase().replaceAll(" ", "-");

    return `<tr>
      <td>${q.id}</td>
      <td><span class="badge cat-${cat}">${cat}</span></td>
      <td><span class="badge diff-${q.difficulty}">${q.difficulty}</span></td>
      <td>${q.options.length} choices</td>
      <td>
        <div class="question-text">${q.question}</div>
        <div class="opt-list">${q.options.map((opt, i) => {
      const isCorrect = opt === q.answer;
      return `<div class="opt ${isCorrect ? "correct" : ""}">
            <span class="opt-letter">${letterArr[i]}</span>
            <span>${opt} ${isCorrect ? "🗸" : ""}</span>
          </div>`;
    }).join("")}</div>
      </td>
    </tr>`;
  }).join("");
}

function filterRows() {
  const cat = document.getElementById('cat-filter').value;
  const diff = document.getElementById('diff-filter').value;

  const filtered = state.questions.filter(q => {
    return (!cat || q.category_id == cat) && (!diff || q.difficulty === diff);
  });

  renderQuestions(filtered);
}



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

  // Clear previous errors first
  document.querySelectorAll('.form-err').forEach(el => el.classList.remove('active'));

  // Validate all fields
  Object.values(fields).forEach(field => {
    if (field.value.trim() === "") {
      const err = field.closest('.field-group')?.querySelector('.form-err')
        ?? field.nextElementSibling;
      err?.classList.add('active');
      isValid = false;
    }
  });

  if (!isValid) return null;

  //get answer value
  const answer = document.getElementById(`opt-${fields.answer.value.trim().toLowerCase()}`).value.trim();



  // Build and return the object only if everything is valid
  return {
    question: fields.q.value.trim(),
    options: [
      fields.optA.value.trim(),
      fields.optB.value.trim(),
      fields.optC.value.trim(),
      fields.optD.value.trim()
    ],
    answer: answer,
    difficulty: fields.diff.value.trim(),
    category_id: fields.cat.value.trim(),
  };
}




// ══════════════════════════════════════════════════════════════════════════════════
//                   Event LIstenEr
// ══════════════════════════════════════════════════════════════════════════════════

document.getElementById("header").addEventListener("click", (e) => {
  if (e.target.id === 'open-modal-btn') { modal.showModal(); passInput.focus() }

})



document.getElementById("home-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-back")) {
    goHome();
  } else if (e.target.classList.contains("play")) {
    showCategories();
  }
});


document.getElementById("category-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("back")) {
    goHome();
  } else if (e.target.classList.contains("retry")) {
    showCategories();
  } else {
    const card = e.target.closest(".category-card-btn");
    if (!card) return;
    startQuiz(Number(card.dataset.id));
  }
});
document.getElementById("category-searchBar").addEventListener("input", function () {
  const query = this.value.trim();
  const filtered = query === "" ? state.categories : state.categories.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

  renderCategories(filtered);
})


document.getElementById("quiz-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("back")) {
    goHome(); Timer.stop(); Timer.clear();
  } else if (e.target.classList.contains("retry")) {
    startQuiz(state.selectedCategory.id);
    // showCategories();
  } else if (e.target.classList.contains("goCat")) {
    showCategories();
  } if (e.target.classList.contains("opt-btn")) {
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
document.getElementById("result-screen").addEventListener("click", (e) => {
  if (e.target.classList.contains("back")) {
    goHome();
  } else if (e.target.classList.contains("retry")) {
    startQuiz(state.selectedCategory.id);
    // showCategories();
  } else if (e.target.classList.contains("goCat")) {
    showCategories();
  }
});

const open = `<svg class="eye-open" xmlns="http://www.w3.org/2000/svg"
  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
  <circle cx="12" cy="12" r="3" />
</svg>`;
const close = `<svg class="eye-close" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`



const modal = document.getElementById("admin-modal");
const passInput = document.getElementById("admin-pass-input");

modal.addEventListener("click", (e) => {
  if (e.target.id === "admin-login-btn") { verifyPassword(); }
  if (e.target.id === "admin-modal-close-btn") { modal.close(); }
  if (e.target.id === 'toggle-btn') {
    const isHidden = passInput.type == 'password';
    passInput.type = isHidden ? 'text' : 'password';
    e.target.innerHTML = isHidden ? open : close;
  }
});
// modal pass input listener
passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); verifyPassword(); } });

//admin

//switch tab
document.querySelectorAll(".admin-tab").forEach(a => { a.addEventListener("click", switchTab) });

//question filter
['cat-filter', 'diff-filter',].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {

    filterRows();
    const el = document.getElementById("question-table");
    window.scrollTo(el);
  });
});

//add question btn
document.getElementById('add-question-btn').addEventListener('click', () => {
  document.getElementById('q-form').classList.add("active");
  renderFormCat();
});

//add question form
document.getElementById("q-form").addEventListener("click", async (e) => {
  if (e.target.id === "btn-cancel") {
    e.currentTarget.classList.remove("active");
    return;
  }
  if (e.target.id === "btn-add") {

    const q = checkIsFormValid();
    console.log(q);

    if (!q) return;
    const res = await Api.addQuestion(q);
    getAdminQuestions()
      .then(() => { loadAdminQuestions(); filterRows(); });




    return;
  }

})




function adjustFont() {

  const el = document.querySelector(".question-card");
  const text = el.querySelector(".q-text")
  let fontSize = 20;

  text.style.fontSize = fontSize + "px";

  while (text.scrollHeight > text.clientHeight && fontSize > 10) {
    fontSize--;
    text.style.fontSize = fontSize + "px";
  }
}

//      git add .
//      git commit -m "your message"
//      git push

