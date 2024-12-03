const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Crear una instancia de la app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurar directorio público para servir archivos estáticos
app.use(express.static('public'));

// Mazo de cartas y jugadores
let mazo = [];
let jugadores = [];
let cartaActual = {};

// Función para crear el mazo de cartas
function crearMazo() {
    const colores = ["rojo", "verde", "amarillo", "azul"];
    const valores = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "salto", "reversa", "robar2"];
    mazo = [];
    colores.forEach(color => {
        valores.forEach(valor => {
            mazo.push({ color, valor });
            if (valor !== "0") { // Añadir segunda carta para valores del 1 al 9, +2, etc.
                mazo.push({ color, valor });
            }
        });
    });
    mazo.push({ color: "negro", valor: "comodín" });
    mazo.push({ color: "negro", valor: "comodín" });
    mazo.push({ color: "negro", valor: "robar4" });
    mazo.push({ color: "negro", valor: "robar4" });
}

// Iniciar el juego
function iniciarJuego() {
    crearMazo();
    mazo = mazo.sort(() => Math.random() - 0.5);
    // Repartir cartas a los jugadores
    jugadores.forEach(socketId => {
        let hand = [];
        for (let i = 0; i < 7; i++) {
            hand.push(mazo.pop());
        }
        io.to(socketId).emit('playerHand', hand);
    });
    cartaActual = mazo.pop();
    io.emit('currentCard', cartaActual);
}

// Conexión de un jugador
io.on('connection', (socket) => {
    console.log('Jugador conectado: ' + socket.id);
    jugadores.push(socket.id);

    if (jugadores.length === 2) {
        iniciarJuego();
    }

    socket.on('joinGame', (playerName) => {
        console.log(`${playerName} ha entrado al juego.`);
    });

    socket.on('playCard', (card) => {
        console.log(`Jugador ${socket.id} jugó la carta ${card.valor} de color ${card.color}`);
        cartaActual = card;  // La carta actual se actualiza
        io.emit('currentCard', cartaActual);  // Notificar a todos los jugadores
    });

    socket.on('disconnect', () => {
        console.log('Jugador desconectado: ' + socket.id);
        const index = jugadores.indexOf(socket.id);
        if (index !== -1) {
            jugadores.splice(index, 1);
        }
    });
});

// Servir la app en el puerto 3000
server.listen(3000, () => {
    console.log('Servidor funcionando en http://localhost:3000');
});