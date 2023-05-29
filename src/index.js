let category = document.querySelector(".category"),
  quizCount = document.querySelector(".quiz-count"),
  quiz = document.querySelector(".quiz"),
  chooseSection = document.querySelector(".choose-section"),
  btn = document.querySelector(".btn"),
  bullets = document.querySelector(".bullets"),
  timer = document.querySelector(".timer"),
  timerId,
  correctAnswersCount = 0,
  wrongAnswersCount = 0,
  selectedOption,
  currentSpanIndex = 1;

//-------------- Functions-------------------

function endQuiz(
  questions,
  timerId,
  quizCount,
  btn,
  quiz,
  chooseSection,
  correctAnswersCount,
  wrongAnswersCount
) {
  clearInterval(timerId);

  if (questions.length > 0) {
    genRandomQuestion(questions);
    highlightNextSpan();
  } else {
    quizCount.textContent = 0;
    btn.remove();
    quiz.innerHTML = "";
    chooseSection.innerHTML = `
      <div class="result">
        You Made
        <div><span class="correct">${correctAnswersCount}</span> Correct Answers</div>
        <div><span class="wrong">${wrongAnswersCount}</span> Wrong Answers</div>
      </div>
    `;
  }
}

function checkOption(option) {
  if (option == correctAnswer) {
    correctAnswersCount++;
  } else {
    wrongAnswersCount++;
  }
}

function highlightNextSpan() {
  if (currentSpanIndex < document.querySelectorAll(".bullets span").length) {
    document
      .querySelectorAll(".bullets span")
      [currentSpanIndex].classList.add("fill");
    currentSpanIndex++;
  }
}

function startTimer() {
  // Timer In Seconds
  let timeLeft = 20;
  timerId = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;

    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(timerId);
      wrongAnswersCount++;

      endQuiz(
        questions,
        timerId,
        quizCount,
        btn,
        quiz,
        chooseSection,
        correctAnswersCount,
        wrongAnswersCount
      );
    }
  }, 1000);
}

function setFalseOptionLabels(labels, falseOptions) {
  labels.forEach((label, index) => {
    label.innerHTML = falseOptions[index];
  });

  startTimer();
}

function setCorrectOptionLabel(randomQuestion) {
  let labels = document.querySelectorAll(".choose-section li label"),
    randomIndex = Math.floor(labels.length * Math.random()),
    randomLabel = labels[randomIndex];

  randomLabel.innerHTML = randomQuestion["correct_answer"];
  window.correctAnswer = randomQuestion["correct_answer"];

  labels = Array.from(labels);
  labels.splice(randomIndex, 1);

  setFalseOptionLabels(labels, randomQuestion["false_answers"]);
}

function createQuizOptions(randomQuestion) {
  chooseSection.innerHTML = "";

  for (let i = 0; i < randomQuestion["false_answers"].length + 1; i++) {
    let li = document.createElement("li");
    li.innerHTML = `
      <input type="radio" name="option" id="option-${i + 1}" />
      <label for="option-${i + 1}"></label>
    `;
    chooseSection.appendChild(li);
  }

  setCorrectOptionLabel(randomQuestion);
}

function genRandomQuestion(questions) {
  window.questions = questions;
  quizCount.innerHTML = questions.length;

  let randomIndex = Math.floor(Math.random() * questions.length),
    randomQuestion = questions[randomIndex];

  quiz.innerHTML = randomQuestion.question;
  questions.splice(randomIndex, 1);

  createQuizOptions(randomQuestion);
}

function genRandomSection(data) {
  const keys = Object.keys(data);
  let randomIndex = Math.floor(keys.length * Math.random()),
    randomSection = keys[randomIndex];

  localStorage.section = randomSection;
  category.innerHTML = localStorage.section;

  // Create Spans Depend On Number Of Quizzes
  for (let i = 0; i < data[localStorage.section].questions.length; i++) {
    let span = document.createElement("span");
    bullets.appendChild(span);
  }
  document.querySelector(".bullets span").classList.add("fill");

  genRandomQuestion(data[localStorage.section].questions);
}

async function getData() {
  try {
    let response = await fetch("./src/quiz.json"),
      data = await response.json();
    window.data = data;
    genRandomSection(data);
  } catch (reason) {
    console.log(reason);
  }
}

// ------------- End of Functions ---------------

// Call Main Function
getData();

btn.addEventListener("click", () => {
  selectedOption = chooseSection.querySelector(
    'input[type="radio"]:checked + label'
  ).textContent;

  checkOption(selectedOption);

  endQuiz(
    questions,
    timerId,
    quizCount,
    btn,
    quiz,
    chooseSection,
    correctAnswersCount,
    wrongAnswersCount
  );
});
