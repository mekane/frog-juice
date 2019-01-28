const actionsModule = require('./actions.js');
const gameState = require('./gameState.js');

let action = actionsModule.act;
let _currentState = gameState.initialState();
let _currentPlayer = null;
let _currentPhase = gameState.SETUP;

const playerAction = {
    CAPTURE: actionsModule.CAPTURE,
    PASS: 'PASS',
    PLAY_BLACK_CAT: actionsModule.BLACK_CAT,
    PLAY_SPELL: actionsModule.PLAY_SPELL,
    PLAY_WITCH: actionsModule.WITCH,
    PLAY_WITCH_WASH: actionsModule.WITCH_WASH
}
const possibleActions = (Object.keys(playerAction).map(key => playerAction[key]));

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

function playerDiscard(cardIndex) {
    _currentPlayer++;
    _currentPhase = 'DRAW';
}

function playerTurn(actionType, options) {
    if (possibleActions.includes(actionType)) {
        const actionOptions = Object.assign({ player: _currentPlayer }, options);
        const nextState = action(actionType, _currentState, actionOptions);

        _currentPhase = 'DISCARD';
    }
}

function reset() {
    action = actionsModule.act;
    _currentState = gameState.initialState();
    _currentPlayer = null;
    _currentPhase = gameState.SETUP;
}

module.exports = {
    currentPhase,
    currentPlayer,
    currentState,
    newGame,
    overrideActionHandler,
    playerAction,
    playerDiscard,
    playerTurn,
    reset
};
