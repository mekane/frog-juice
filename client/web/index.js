/**
 * This gets built with webpack, hence the mixing and matching of module styles
 */
const game = require('../../app/main.js');

export function start(numberOfPlayers) {
    game.newGame(numberOfPlayers);
}

export function getState() {
    return game.currentState();
}

console.log('game bundle init')