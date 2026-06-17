const grid = document.getElementById('grid');
const movesDisplay = document.getElementById('moves');
let cards = ['🐶', '🐶', '🐱', '🐱', '🐭', '🐭', '🐹', '🐹', '🐰', '🐰', '🦊', '🦊', '🐻', '🐻', '🐼', '🐼'];
let moves = 0;
let flippedCards = [];
let matchedCards = 0;

// シャッフル
cards.sort(() => 0.5 - Math.random());

function createBoard() {
    for (let i = 0; i < cards.length; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = i;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    }
}

function flipCard() {
    let cardId = this.dataset.id;
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        this.innerText = cards[cardId];
        flippedCards.push({ id: cardId, element: this });

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.innerText = moves;
            setTimeout(checkForMatch, 500);
        }
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (cards[card1.id] === cards[card2.id]) {
        matchedCards += 2;
        if (matchedCards === cards.length) {
            setTimeout(() => {
                alert(`クリア！手数: ${moves}`);
                document.location.reload();
            }, 300);
        }
    } else {
        card1.element.classList.remove('flipped');
        card1.element.innerText = '';
        card2.element.classList.remove('flipped');
        card2.element.innerText = '';
    }

    flippedCards = [];
}

createBoard();
