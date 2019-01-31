const actionsModule = require('./actions.js');
const gameState = require('./gameState.js');

let action = actionsModule.act;
let _currentState = gameState.initialState();
let _currentPlayer = null;
let _currentPhase = gameState.SETUP;

const numberOfPlayers = Object.keys(_currentState.players.byId).length;

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
    if (_currentPhase !== gameState.DISCARD)
        return;

    const options = {
        player: _currentPlayer,
        card: cardIndex
    };
    const nextState = action(actionsModule.DISCARD, _currentState, options);

    if (nextState !== _currentState) {
        _currentState = nextState;
        _currentPlayer++;
        _currentPhase = gameState.DRAW;

        if (_currentPlayer > (numberOfPlayers - 1)) {
            _currentPlayer = 0;
        }

        if (_currentState.players.byId[_currentPlayer].hand.length >= 4) {
            _currentPhase = gameState.PLAY;
        }
    }
}

function playerDraw() {
    if (_currentPhase !== gameState.DRAW)
        return;

    const nextState = action(gameState.DRAW, _currentState, { player: _currentPlayer });
    _currentState = nextState;

    const cardsInPlayersHand = _currentState.players.byId[_currentPlayer].hand.length;
    if (cardsInPlayersHand >= 4) {
        _currentPhase = gameState.PLAY;
    }
}

function playerTurn(actionType, options) {
    if (_currentPhase !== gameState.PLAY)
        return;

    if (possibleActions.includes(actionType)) {
        const actionOptions = Object.assign({ player: _currentPlayer }, options);
        const nextState = action(actionType, _currentState, actionOptions);

        if (nextState.error)
            console.log(`ERROR: ${nextState.error}`)

        const noError = !nextState.error;
        const actionSuccess = (nextState !== _currentState) || (actionType === playerAction.PASS);
        const okToTransition = (noError && actionSuccess);

        if (okToTransition) {
            _currentState = nextState;
            _currentPhase = gameState.DISCARD;
        }
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
    playerDraw,
    playerDiscard,
    playerTurn,
    reset
};
