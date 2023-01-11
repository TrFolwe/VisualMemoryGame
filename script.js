let isStartedGame = false;
let isFinishedProcess = false;
const gameInfoText = document.querySelector("h4.gameInfoText");
let cardData = [];
const rand = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const wait = ms => new Promise(r => setTimeout(r, ms));
let CARD_SELECT_COUNT = 2;
let score = 0;
let level = 1;
const CARD_DEFAULT_BACKGROUND_COLOR = getComputedStyle(document.querySelector("li.memoryCard")).backgroundColor;

const isModalState = () => getComputedStyle(document.querySelector(".modalContent")).display !== "none";

window.addEventListener("keydown", event => {
    if (isModalState) {
        if (event.key === "Escape") closeModal();
        else if (event.key === "Enter") continueGame();
    }
});

document.querySelectorAll("li.memoryCard").forEach(card => card.addEventListener("click", () => cardClick(card)))

async function startGame(e) {
    if (e.innerHTML === "RESTART GAME") {
        resetGame(true);
        await wait(500);
        startGame(e);
    }
    if (!isStartedGame && !isModalState()) {
        isStartedGame = true;
        await startCounter();
        await shuffleCard();
        isFinishedProcess = true;
    }
}

setInterval(() => { //score set
    document.querySelector(".scoreResult").innerHTML = score;
    CARD_SELECT_COUNT = level * 2;
    const startButton = document.querySelector(".startButton");
    if (isStartedGame && isFinishedProcess) {
        if (startButton.innerHTML !== "RESTART GAME") startButton.innerHTML = "RESTART GAME"
    }
    else if (startButton.innerHTML !== "START GAME") startButton.innerHTML = "START GAME";

    document.querySelector(".levelResult").innerHTML = level;
}, 1000 / 60);

function openModal({ title, content, type }) {
    $(".modalBackground, .modalContent").fadeIn(250)
    document.querySelectorAll(".modalBackground, .modalContent").forEach(i => i.style.display = "block");
    document.querySelector(".modalContent h2").innerHTML = title;
    document.querySelector(".modalContent p").innerHTML = content;
    if (type === "modal:right_choice" || type === "modal:wrong_choice") {
        const nextButton = `<button onclick="continueGame()" class="continue-btn">${type === "modal:right_choice" ? "Continue" : "Try again"}</button>`;
        document.querySelector(".modalContent").innerHTML += nextButton;
    }
}

function shuffleCard() {
    return new Promise(async r => {
        for (let i = 1; i <= CARD_SELECT_COUNT; i++) {
            let randIndex = rand(0, 8);
            do { randIndex = rand(0, 8); } while (cardData.includes(randIndex))
            cardData.push(randIndex);
        }

        let index = 0;
        const intrvl = setInterval(() => {
            if (index === cardData.length) {
                clearInterval(intrvl);
                return r();
            }
            const cardIndex = cardData[index];
            cardLight(document.querySelector(`.memoryGame .memoryCard[index="${cardIndex}"]`))
            index++;
        }, 2000 / level);
    });

    async function cardLight(cardElement) {
        //await wait(1000);
        cardElement.style["background-color"] = "white";
        cardElement.style["color"] = "black";
        new Audio("./sounds/audio.mp3").play();
        await wait(1000);
        cardElement.style["background-color"] = "#434242";
        cardElement.style["color"] = "white";
    }
}

let cardIndexDesk = 0;

async function cardClick(card) {
    if (!isStartedGame || !isFinishedProcess) return;
    const cardIndex = card.getAttribute("index");
    const cardDataIndex = cardData[cardIndexDesk];
    new Audio("./sounds/audio.mp3").play();
    if (card.hasAttribute("selected")) return;
    card.setAttribute("selected", "true");

    if (cardDataIndex != cardIndex) {
        card.style["background-color"] = "red";
        await wait(500);
        return openModal({
            title: "Wrong choice",
            content: `The right combination: ${cardData.map(i => i + 1).join(", ")}<br>Max score: ${score}`,
            type: "modal:wrong_choice"
        });
    }

    cardIndexDesk++;
    card.style["background-color"] = "green";
    if (cardIndexDesk === cardData.length) {
        score += 5;
        if ((score % 10 === 0) && score !== 0) level++;
        openModal({
            title: "Well done <3",
            content: `The right combination: ${cardData.map(i => i + 1).join(", ")}<br>Your score: ${score}${((score % 10 === 0) && score !== 0) ? '<br>you have leveled up' : ''}`,
            type: "modal:right_choice"
        });
    }
}

function resetGame(isLosed = false) {
    cardData = [];
    isStartedGame = false;
    isFinishedProcess = false;
    cardIndexDesk = 0;
    if (isLosed) {
        level = 1;
        score = 0;
    }
    gameInfoText.innerHTML = "Please game start";
    document.querySelectorAll("li.memoryCard").forEach(card => {
        card.style["background-color"] = CARD_DEFAULT_BACKGROUND_COLOR;
        if (card.hasAttribute("selected")) card.removeAttribute("selected");
    })
}

function startCounter() {
    return new Promise(r => {
        gameInfoText.innerHTML = "3";
        const intrvlId = setInterval(() => {
            if (gameInfoText.innerHTML === "1") {
                clearInterval(intrvlId);
                gameInfoText.innerHTML = "Can you know them all?";
                return r();
            }
            gameInfoText.innerHTML = Number.parseInt(gameInfoText.innerHTML) - 1;
        }, 1000);
    })
}

const closeModal = () => {
    $(".modalBackground, .modalContent").fadeOut(250);
    const modalTitle = document.querySelector(".modalContent h2").innerHTML;
    if (modalTitle === "Wrong choice") resetGame(true);
    else if (modalTitle !== "How do play?") resetGame();
}

async function continueGame() {
    closeModal();
    await wait(500);
    startGame(document.querySelector(".startButton"));
}

const howPlay = () => openModal({ title: "How do play?", content: "It is an intelligence game played by correctly matching the combinations given to you.", type: "modal:help_play" })