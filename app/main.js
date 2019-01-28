const actionsModule = require('./actions.js');
const gameState = require('./gameState.js');

let action = actionsModule.act;
let _currentState = gameState.initialState();
let _currentPlayer = null;
let _currentPhase = gameState.SETUP;

function currentPlayer() {
    return _currentPlayer;
}

function currentPhase() {
    return _currentPhase;
}

function currentState() {
    return _currentState;
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

    _currentState = next;
    _currentPlayer = 0;
    _currentPhase = gameState.PLAY;
}

function overrideActionHandler(newActionHandler) {
    action = newActionHandler;
}

function playerTurn(actionType, options) {
    const actionOptions = Object.assign({ player: _currentPlayer }, options);
    const nextState = action(actionType, _currentState, actionOptions);

    _currentPhase = 'DISCARD';
}


module.exports = {
    currentPhase,
    currentPlayer,
    currentState,
    newGame,
    overrideActionHandler,
    playerTurn
};
