const categories = {
  colors: ["red", "blue", "yellow", "green", "orange", "purple", "pink"],
  fruits: ["apple", "banana", "orange", "strawberry", "grape", "pineapple", "watermelon"],
  vegetables: ["carrot", "tomato", "potato", "broccoli", "lettuce", "cucumber"]
};

let currentCategory = "";
let currentIndex = 0;
let correctCount = 0;
let errorCount = 0;
let draggedWord = null;

const imageElement = document.getElementById("main-image");
const startButton = document.getElementById("start-button");
const categoryButtons = document.getElementById("category-buttons");
const wordButtonsContainer = document.getElementById("word-buttons");
const scoreDisplay = document.getElementById("score-display");
const resultDisplay = document.getElementById("result");
const restartButton = document.getElementById("restart-button");

const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const finishSound = document.getElementById("finish-sound");
const buttonSound = document.getElementById("button-sound");
const categorySound = document.getElementById("category-sound");
const wordSound = document.getElementById("word-sound");
const gameloopSound = document.getElementById("gameloop-sound");

// Mostrar botón Start al cargar
startButton.classList.add("show");

// Transiciones suaves
function showWithFade(element) {
  element.classList.remove("hidden");
  element.classList.add("fade");
  setTimeout(() => {
    element.classList.add("show");
  }, 10);
}

function hideWithFade(element) {
  element.classList.remove("show");
  setTimeout(() => {
    element.classList.add("hidden");
    element.classList.remove("fade");
  }, 500);
}

// Inicio del juego
startButton.addEventListener("click", () => {
  hideWithFade(startButton);
  hideWithFade(imageElement);
  showWithFade(categoryButtons);
});

// Selección de categoría
categoryButtons.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    buttonSound.currentTime = 0;
    buttonSound.play();

    currentCategory = btn.dataset.category;
    currentIndex = 0;
    correctCount = 0;
    errorCount = 0;

    hideWithFade(categoryButtons);
    showWithFade(wordButtonsContainer);
    showWithFade(imageElement);
    resultDisplay.classList.add("hidden");
    restartButton.classList.add("hidden");
    scoreDisplay.classList.add("hidden");

    playCategorySound(currentCategory);
  });
});

// Reproduce sonido de categoría
function playCategorySound(category) {
  categorySound.src = `sounds/${category}.mp3`;
  categorySound.currentTime = 0;
  categorySound.play();

  categorySound.onended = () => {
    gameloopSound.currentTime = 0;
    gameloopSound.play();
    loadNextItem();
  };
}

// Carga siguiente palabra
function loadNextItem() {
  const items = categories[currentCategory];
  if (currentIndex >= items.length) {
    showFinalScreen();
    return;
  }

  const currentWord = items[currentIndex];

  // Corrección específica para nombres duplicados
  let imageName = currentWord;
  if (currentCategory === "fruits" && currentWord === "orange") imageName = "oranged";

  imageElement.src = `assets/${imageName}.jpeg`;
  wordSound.src = `sounds/${currentWord}.mp3`;
  wordSound.play();

  imageElement.setAttribute("data-answer", currentWord);
  imageElement.setAttribute("draggable", "false");

  const options = generateOptions(currentWord, items);
  wordButtonsContainer.innerHTML = "";

  options.forEach(word => {
    const btn = document.createElement("button");
    btn.textContent = capitalize(word);
    btn.classList.add("word-button");
    btn.setAttribute("draggable", "true");

    btn.addEventListener("dragstart", () => {
      draggedWord = word;
      buttonSound.currentTime = 0;
      buttonSound.play();
    });

    btn.addEventListener("dragend", () => {
      draggedWord = null;
    });

    wordButtonsContainer.appendChild(btn);
  });
}

// Genera opciones de palabras
function generateOptions(correct, pool) {
  const distractors = pool.filter(item => item !== correct);
  const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...shuffled, correct].sort(() => 0.5 - Math.random());
}

// Capitaliza palabra
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Validación por arrastre
imageElement.addEventListener("dragover", e => {
  e.preventDefault();
});

imageElement.addEventListener("drop", () => {
  if (!draggedWord) return;

  const correctAnswer = imageElement.getAttribute("data-answer");
  const answer = draggedWord.trim().toLowerCase();

  resultDisplay.classList.remove("hidden");

  if (answer === correctAnswer) {
    resultDisplay.textContent = "✅ Correct!";
    resultDisplay.style.color = "green";
    correctSound.currentTime = 0;
    correctSound.play();
    correctCount++;
  } else {
    resultDisplay.textContent = "❌ Try again.";
    resultDisplay.style.color = "red";
    wrongSound.currentTime = 0;
    wrongSound.play();
    errorCount++;
  }

  draggedWord = null;
  currentIndex++;
  setTimeout(() => {
    resultDisplay.classList.add("hidden");
    loadNextItem();
  }, 1000);
});

// Pantalla final
function showFinalScreen() {
  imageElement.src = "assets/finish.jpeg";
  hideWithFade(wordButtonsContainer);
  hideWithFade(categoryButtons);
  wordButtonsContainer.innerHTML = "";

  gameloopSound.pause();
  gameloopSound.currentTime = 0;
  finishSound.play();

  const total = correctCount + errorCount;
  const score = total > 0 ? ((correctCount / total) * 10).toFixed(1) : "0.0";
  scoreDisplay.textContent = `Score: ${score}`;
  scoreDisplay.style.color = score >= 6 ? "green" : "red";
  showWithFade(scoreDisplay);
  showWithFade(restartButton);
}

// Reinicio del juego
restartButton.addEventListener("click", () => {
  gameloopSound.pause();
  gameloopSound.currentTime = 0;

  hideWithFade(restartButton);
  hideWithFade(scoreDisplay);
  hideWithFade(wordButtonsContainer);
  hideWithFade(categoryButtons);
  resultDisplay.classList.add("hidden");
  wordButtonsContainer.innerHTML = "";
  imageElement.src = "assets/title.jpeg";
  showWithFade(startButton);
});
