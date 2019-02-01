const actionsModule = require('./actions.js');
const gameState = require('./gameState.js');

let action = actionsModule.act;
let _currentState = null;
let _currentPlayer = null;
let _currentPhase = gameState.SETUP;
let _playersEligibleForIngredientAskThisTurn = [];

const playerAction = {
    CAPTURE: actionsModule.CAPTURE,
    PASS: 'PASS',
    PLAY_BLACK_CAT: actionsModule.BLACK_CAT,
    PLAY_SPELL: actionsModule.PLAY_SPELL,
    PLAY_WITCH: actionsModule.WITCH,
    PLAY_WITCH_WASH: actionsModule.WITCH_WASH
}
const possibleActions = (Object.keys(playerAction).map(key => playerAction[key]));

function askForIngredient(options) {
    _removeAskedPlayerFromEligibleList(options.target);
}

function currentPlayer() {
    return _currentPlayer;
}

function currentPhase() {
    return _currentPhase;
}

function currentState() {
    return _currentState;
}

/**
 * Note: returns string ids because of Object.keys. Beware!
 */
function listPlayersWhoHaveNotBeenAskedForIngredients() {
    return _playersEligibleForIngredientAskThisTurn;
}

function newGame(number, optionalActionHandlerOverride) {
    const numberOfPlayers = number || 2;

    _resetState(numberOfPlayers);

    if (typeof optionalActionHandlerOverride == 'function')
        action = optionalActionHandlerOverride;

    let next = _currentState;
    next = action(actionsModule.DRAW, next, { player: 0 });
    next = action(actionsModule.DRAW, next, { player: 0 });
    next = action(actionsModule.DRAW, next, { player: 0 });
    next = action(actionsModule.DRAW, next, { player: 0 });

    next = action(actionsModule.DRAW, next, { player: 1 });
    next = action(actionsModule.DRAW, next, { player: 1 });
    next = action(actionsModule.DRAW, next, { player: 1 });
    next = action(actionsModule.DRAW, next, { player: 1 });

    if (numberOfPlayers >= 3) {
        next = action(actionsModule.DRAW, next, { player: 2 });
        next = action(actionsModule.DRAW, next, { player: 2 });
        next = action(actionsModule.DRAW, next, { player: 2 });
        next = action(actionsModule.DRAW, next, { player: 2 });
    }

    if (numberOfPlayers >= 4) {
        next = action(actionsModule.DRAW, next, { player: 3 });
        next = action(actionsModule.DRAW, next, { player: 3 });
        next = action(actionsModule.DRAW, next, { player: 3 });
        next = action(actionsModule.DRAW, next, { player: 3 });
    }

    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);

    _currentState = next;
    _currentPlayer = 0;
    _currentPhase = gameState.PLAY;
    _resetIngredientAskList();
}

function playerCanTakeIngredients() {
    const numberOfSpellsInProgress = _currentState.players.byId[_currentPlayer].spells.length;
    const hasSpellInprogress = (numberOfSpellsInProgress > 0);
    const thereAreAnyPlayersToAsk = _playersEligibleForIngredientAskThisTurn.length > 0;
    const thereAreAnyCardsOnTable = _currentState.table.length > 0;

    return (hasSpellInprogress && (thereAreAnyPlayersToAsk || thereAreAnyCardsOnTable));
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
        const numberOfPlayers = Object.keys(nextState.players.byId).length;
        _currentState = nextState;
        _currentPlayer++;
        _currentPhase = gameState.DRAW;

        if (_currentPlayer > (numberOfPlayers - 1)) {
            _currentPlayer = 0;
        }

        if (_currentState.players.byId[_currentPlayer].hand.length >= 4) {
            _currentPhase = gameState.PLAY;
        }

        //this is part of the "start next turn" logic
        _resetIngredientAskList();
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

function _removeAskedPlayerFromEligibleList(playerId) {
    const newList = _playersEligibleForIngredientAskThisTurn.filter(pid => pid != playerId);
    _playersEligibleForIngredientAskThisTurn = newList;
}

function _resetState(num) {
    action = actionsModule.act;
    _currentState = gameState.initialState(num);
    _currentPlayer = null;
    _currentPhase = gameState.SETUP;
    _resetIngredientAskList();
}

function _resetIngredientAskList() {
    const players = _currentState.players || {};
    const allPlayerIds = Object.keys(players.byId || {});
    _playersEligibleForIngredientAskThisTurn = allPlayerIds;
    _removeAskedPlayerFromEligibleList(_currentPlayer);
}

module.exports = {
    askForIngredient,
    currentPhase,
    currentPlayer,
    currentState,
    listPlayersWhoHaveNotBeenAskedForIngredients,
    newGame,
    playerAction,
    playerCanTakeIngredients,
    playerDraw,
    playerDiscard,
    playerTurn
};
