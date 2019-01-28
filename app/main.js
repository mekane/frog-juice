const actionsModule = require('./actions.js');
const gameState = require('./gameState.js');

let action = actionsModule.act;
let currentGameState = gameState.initialState();

function currentState() {
    return currentGameState;
}

function newGame() {
    let next = gameState.initialState();

    next = action(actionsModule.DRAW, next, { player: 0 });
    next = action(actionsModule.DRAW, next, { player: 0 });
    next = action(actionsModule.DRAW, next, { player: 0 });
    next = action(actionsModule.DRAW, next, { player: 0 });

    next = action(actionsModule.DRAW, next, { player: 1 });
    next = action(actionsModule.DRAW, next, { player: 1 });
    next = action(actionsModule.DRAW, next, { player: 1 });
    next = action(actionsModule.DRAW, next, { player: 1 });

    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);

    currentGameState = next;

    //hack
    currentGameState.currentPlayer = 0;
    currentGameState.currentState = gameState.PLAY;
}

function overrideActionHandler(newActionHandler) {
    action = newActionHandler;
}

module.exports = {
    currentState,
    newGame,
    overrideActionHandler
};
