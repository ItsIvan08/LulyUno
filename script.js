const socket = io();

let playerHand = [];

// Conectar al servidor
socket.on('connect', () => {
    console.log('Conectado al servidor');
    socket.emit('joinGame', 'Jugador');
});

// Recibir cartas del servidor
socket.on('playerHand', (hand) => {
    playerHand = hand;
    renderHand();
});

// Recibir carta actual
socket.on('currentCard', (card) => {
    document.getElementById('current-card').innerHTML = `<div class="card" style="background-color: ${card.color};">${card.valor}</div>`;
});

// Función para mostrar las cartas del jugador
function renderHand() {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.style.backgroundColor = card.color;
        cardElement.innerText = card.valor;
        cardElement.addEventListener('click', () => playCard(index));
        handContainer.appendChild(cardElement);
    });
}

// Función para jugar una carta
function playCard(index) {
    const card = playerHand[index];
    socket.emit('playCard', card);
}