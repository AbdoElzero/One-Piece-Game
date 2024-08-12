const pageAll = document.querySelector(".page");
const playNowBtn = document.querySelector(".start");
const exit = document.querySelector(".start .one");
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const hangmanImage = document.querySelector(".hangman-box img");
const gameModal = document.querySelector(".game-modal");
const gameCon = document.querySelector(".game-modal .content .btns");
const playAgainBtn = gameModal.querySelector("button");
const resetGameBtn = document.createElement("button");
const timerSpan = document.getElementById("timer")

const questionCounterSpan = document.getElementById("questionCounter");
const updateQuestionCounter = () => {
    questionCounterSpan.innerHTML =`${totalQuestions} / ${wordList.length}`
}

exit.addEventListener("click", function() {
    setTimeout(() => {
        pageAll.style.display = "flex"
        playNowBtn.style.display = "none"
        startTimer()
    }, 1000)
})

let coins = 0;
const coinsSpan = document.getElementById("coins");

const updateCoins = (isCorrect) => {
    if (isCorrect) {
        coins +=3;
    } else {
        coins = Math.max(coins -1, 0);
    }
    displayCoins();
};

const displayCoins = () => {
    coinsSpan.innerHTML = coins;
};

// Initializing game variables
let currentWord, correctLetters, wrongGuessCount, totalQuestions = 0, correctAnswers = 0;
let usedWords = [];
let questionTimer;
const maxGuesses = 6;
const questionTimerLimit = 30;

// إضافة زر "إعادة تعيين اللعبة" إلى الـ DOM
resetGameBtn.innerText = "Restart";
resetGameBtn.classList.add("final-play-again");
resetGameBtn.style.display = 'block';
gameCon.appendChild(resetGameBtn);

const revealLetterBtn = document.getElementById("reveal-letter-btn")

const revealLetter = () => {

    if (coins >= 6) {
        let hiddenLetters = [];

        wordDisplay.querySelectorAll("li").forEach((li, index) => {
            if (!li.classList.contains("guessed")) {
                hiddenLetters.push(index);
            }
        });

        if (hiddenLetters.length > 0) {
            const randomIndex = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
            const letterToReveal = currentWord[randomIndex];

            correctLetters.push(letterToReveal);
            wordDisplay.querySelectorAll("li")[randomIndex].innerHTML = letterToReveal;
            wordDisplay.querySelectorAll("li")[randomIndex].classList.add("guessed");

            coins = Math.max(coins - 6, 0);
            displayCoins();

            if (correctLetters.length === currentWord.length) {
                updateCoins(true)
                stopTimer();
                return gameOver(true);
            }
        }
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "You don't have enough coins to reveal a letter \nprice of the letter 10 coins",
          });
    }
}

revealLetterBtn.addEventListener("click", revealLetter);


const resetGame = () => {
    // Resetting game variables and UI elements
    correctLetters = [];
    wrongGuessCount = 0;
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
    wordDisplay.innerHTML = currentWord.split("").map(() => `<li class="letter"></li>`).join("");
    keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
    gameModal.classList.remove("show");
    playAgainBtn.style.display = 'none'; // Hide the play again button until needed
    resetGameBtn.style.display = 'none'; // Hide the reset game button until needed
}

const startTimer = () => {
    clearInterval(questionTimer)
    let timeLeft = questionTimerLimit;
    timerSpan.innerHTML = timeLeft;

    questionTimer = setInterval(() => {
        timeLeft--;
        timerSpan.innerHTML = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            nextQuestion()
        }
    }, 1000)
}

const stopTimer = () => {
    clearInterval(questionTimer)
}

const getRandomWord = () => {
    // Filter unused words
    const availableWords = wordList.filter(item => !usedWords.includes(item.word));
    if (availableWords.length === 0) {
        // All words used, show final results
        return showFinalResults();
    }
    // Selecting a random word, hint, and image from the availableWords
    const { word, hint, image } = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentWord = word; // Making currentWord as random word
    document.querySelector(".hint-text b").innerText = hint;
    document.querySelector(".word-image").src = image; // Updating the word image
    usedWords.push(word); // Add word to usedWords
    totalQuestions++; // Increment total questions
    updateQuestionCounter()
    resetGame();
    if (totalQuestions > 1) {
        startTimer()
    }
}

const nextQuestion = () => {
    clearInterval(questionTimer)
    if (totalQuestions >= wordList.length) {
        return showFinalResults()
    }
    getRandomWord()
}

const gameOver = (isVictory) => {
    // After game complete.. showing modal with relevant details
    const modalText = isVictory ? `You found the word:` : 'The correct word was:';
    gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
    gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!';
    gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
    gameModal.classList.add("show");
    playAgainBtn.style.display = 'block'; // Show play again button
    resetGameBtn.style.display = 'block'; // Show reset game button
    if (isVictory) correctAnswers++;
}

const showFinalResults = () => {
    clearInterval(questionTimer);
    // Showing final results after all questions are used
    gameModal.querySelector("img").src = `images/favicon.ico`;
    gameModal.querySelector("h4").innerText = 'All Questions Answered!';
    gameModal.querySelector("p").innerHTML = `You answered ${correctAnswers} out of ${totalQuestions} questions correctly.`;
    gameModal.classList.add("show");
    playAgainBtn.style.display = 'block'; // Show play again button
    resetGameBtn.style.display = 'block'; // Show reset game button
}

const initGame = (button, clickedLetter) => {
    // Checking if clickedLetter is exist on the currentWord
    if(currentWord.includes(clickedLetter)) {
        // Showing all correct letters on the word display
        [...currentWord].forEach((letter, index) => {
            if(letter === clickedLetter) {
                correctLetters.push(letter);
                wordDisplay.querySelectorAll("li")[index].innerText = letter;
                wordDisplay.querySelectorAll("li")[index].classList.add("guessed");
            }
        });
    } else {
        // If clicked letter doesn't exist then update the wrongGuessCount and hangman image
        wrongGuessCount++;
    }
    button.disabled = true; // Disabling the clicked button so user can't click again
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

    if (correctLetters.length === currentWord.length) {
        updateCoins(true)
        stopTimer()
        return gameOver(true)
    }


    if (wrongGuessCount === maxGuesses) {
        updateCoins(false)
        stopTimer()
        return gameOver(false)
    }


    // Calling gameOver function if any of these condition meets
    if(wrongGuessCount === maxGuesses) return gameOver(false);
    if(correctLetters.length === currentWord.length) return gameOver(true);
}

const resetFullGame = () => {
    // Reset all game variables and start a new game
    usedWords = [];
    totalQuestions = 0;
    correctAnswers = 0;
    playAgainBtn.style.display = 'none';
    resetGameBtn.style.display = 'none'; // Hide reset game button
    updateQuestionCounter()
    getRandomWord();
    startTimer()
}

updateQuestionCounter()
// Creating keyboard buttons and adding event listeners
for (let i = 97; i <= 122; i++) {
    const button = document.createElement("button");
    button.innerText = String.fromCharCode(i);
    keyboardDiv.appendChild(button);
    button.addEventListener("click", (e) => initGame(e.target, String.fromCharCode(i)));
}

displayCoins()
getRandomWord();
playAgainBtn.addEventListener("click", getRandomWord); // Reset only the current word
resetGameBtn.addEventListener("click", resetFullGame); // Reset the full game when all questions are answered


