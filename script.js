let quizData = [];
let currentQuestionIndex = 0;
let guessedCorrectly = 0;
let userSelections = [false, false, false, false];

async function initializeGame(event) {
    const selectionId = event.target.id;

    try {
        const dataPath = selectionId === 'movies' ? './movies_questions.json' : './tvseries_questions.json';
        quizData = await fetch(dataPath, { mode: 'no-cors' }).then(response => response.json());
    } catch (error) {
        console.error(error);
        return;
    }

    ["start-again", "score", "start", "start-again"].forEach(id => document.getElementById(id).classList.add("hidden"));
    ["question", "buttons"].forEach(id => document.getElementById(id).classList.remove("hidden"));

    mixElements(quizData);
    quizData = quizData.slice(0, 10);
    quizData.forEach(item => {
        if (item.type === "truefalse") return;
        mixElements(item.options);
    });
    refreshQuestion(quizData[currentQuestionIndex]);
}

function mixElements(elements) {
    for (let index = elements.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [elements[index], elements[randomIndex]] = [elements[randomIndex], elements[index]];
    }
}

function refreshQuestion(item) {
    document.getElementById("question").innerHTML = item.question;
    const answerButtons = document.querySelectorAll('.answer');

    // Update UI based on question type
    updateUIForQuestionType(item.type);

    // Populate answer buttons
    setTimeout(() => {
        answerButtons.forEach((button, index) => {
            if (item.options[index] == null) return;
            button.classList.remove("hidden");
            button.innerHTML = item.options[index];
            button.classList.remove("dbl", "is-error", "is-success");
        });
    }, 50);
}

function updateUIForQuestionType(questionType) {
    const elementsToShow = [];
    const elementsToHide = ["image", "multiple-disclaimer", "next"];

    ["answer2", "answer3", "answer3", "answer4"].forEach(id => document.getElementById(id).classList.remove("hidden"));

    if (questionType === "multiple") {
        elementsToShow.push("multiple-disclaimer", "next");
    } else if (questionType === "image") {
        elementsToShow.push("image");
        document.getElementById("image").src = quizData[currentQuestionIndex].image_href;
    } else if (questionType === "truefalse") {
        // hide last two buttons
        elementsToHide.push("answer3", "answer4");
    }

    elementsToShow.forEach(id => document.getElementById(id).classList.remove("hidden"));
    elementsToHide.filter(id => !elementsToShow.includes(id)).forEach(id => document.getElementById(id).classList.add("hidden"));
}

function handleAnswerSelection(event) {
    if (event.target.classList.contains("dbl")) return;

    const selectedAnswerIndex = parseInt(event.target.id.slice(-1)) - 1;
    userSelections[selectedAnswerIndex] = !userSelections[selectedAnswerIndex];
    event.target.classList.toggle("active");

    if (["single", "truefalse", "image"].includes(quizData[currentQuestionIndex].type)) {
        checkUserAnswers();
    }
}

function checkUserAnswers() {
    let currentQuestion = quizData[currentQuestionIndex];

    let validatedAnswers = [];
    currentQuestion.options.forEach((option, index) => {
        if (!userSelections[index]) {
            validatedAnswers[index] = undefined;
        } else {
            validatedAnswers[index] = currentQuestion.correct_answers.includes(option);
        }
        updateAnswerButtonUI(index, validatedAnswers[index], option);
    });
    toggleAnswerButtons(true);

    setTimeout(() => {
        if (currentQuestionIndex === quizData.length - 1) {
            finalizeGame();
            return;
        }
        resetAnswerButtons();
        currentQuestionIndex++;
        refreshQuestion(quizData[currentQuestionIndex]);
    }, 2000);
}

function updateAnswerButtonUI(index, isCorrect, option) {
    const button = document.getElementById(`answer${index + 1}`);
    button.classList.remove("btn-primary");
    if (isCorrect) {
        guessedCorrectly++;
        button.classList.add("is-success");
    } else if (isCorrect === false) {
        button.classList.add("is-error");
    } else if (quizData[currentQuestionIndex].correct_answers.includes(option)) {
        button.classList.add("is-success");
    }
}

function finalizeGame() {
    let totalCorrectAnswers = quizData.reduce((accumulator, current) => accumulator + current.correct_answers.length, 0);
    if (guessedCorrectly < 0) guessedCorrectly = 0;

    document.getElementById("score-int").textContent = `Score: ${guessedCorrectly}/${totalCorrectAnswers}`;
    toggleUIElements(["score", "start-again"], ["question", "image", "buttons","next"]);
    resetAnswerButtons();
    resetGameParameters();
}

function resetGameParameters() {
    currentQuestionIndex = 0;
    quizData = [];
    guessedCorrectly = 0;
}

function toggleUIElements(toShow, toHide) {
    toShow.forEach(id => document.getElementById(id).classList.remove("hidden"));
    toHide.forEach(id => document.getElementById(id).classList.add("hidden"));
}

function toggleAnswerButtons(disable) {
    for (let i = 0; i < 4; i++) {
        document.getElementById(`answer${i + 1}`).classList.toggle("dbl", disable);
    }
}

function resetAnswerButtons() {
    for (let i = 0; i < 4; i++) {
        const button = document.getElementById(`answer${i + 1}`);
        button.className = "button is-white answer";
    }
    userSelections = [false, false, false, false];
}

function restartQuiz() {
    toggleUIElements(["start"], ["start-again", "score", "question"]);
    resetGameParameters();
}

function handleNextQuestion() {
    checkUserAnswers();
}

function initiateQuizStart() {
    document.querySelectorAll('.start-button').forEach(button => button.addEventListener('click', initializeGame));
}

document.addEventListener('DOMContentLoaded', initiateQuizStart);


