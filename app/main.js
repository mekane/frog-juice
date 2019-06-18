const actionsModule = require('./actions.js');
const gameState = require('./gameState.js');

let action = actionsModule.act;
let _currentState = null;
let _currentPlayer = null;
let _currentPhase = gameState.SETUP;
let _currentTurn = 0;
let _playerActionsRemaining = 1;
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
    if (_playersEligibleForIngredientAskThisTurn.includes(options.target + ''))
        _removeAskedPlayerFromEligibleList(options.target);
    else
        return;

    if (_currentPhase !== gameState.PLAY)
        return;

    const actionOptions = Object.assign({ player: _currentPlayer }, options);
    const nextState = action(actionsModule.TAKE_INGREDIENT_FROM_PLAYER, _currentState, actionOptions);

    if (_currentState !== nextState) {
        _currentState = nextState;

        if (nextState.error) {
            console.log(`Alert: Player ${options.player} does not have ${options.cardName}`);
        }
    }
}

function _checkForGameOver() {
    const deckIsEmpty = _currentState.deck.length === 0;

    const allPlayerIds = Object.keys(_currentState.players.byId);
    const allPlayers = allPlayerIds.map(id => _currentState.players.byId[id]);
    const allPlayersHandsAreEmpty = allPlayers.every(player => player.hand.length === 0);

    const gameOver = deckIsEmpty && allPlayersHandsAreEmpty;

    if (gameOver) {
        _currentPlayer = null;
        _currentPhase = gameState.OVER;
        _playersEligibleForIngredientAskThisTurn = [];
    }
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

function getPlayerScores() {
    const player = _currentState.players.byId
    const allPlayerIds = Object.keys(player);

    const scores = allPlayerIds.map(countCapturedPowerCards);

    let maxCaptured = 0;
    allPlayerIds.forEach(id => {
        const numberOfCapturedCards = player[id].captured.length;
        if (numberOfCapturedCards > maxCaptured)
            maxCaptured = numberOfCapturedCards;
    });

    allPlayerIds.forEach(id => {
        const numberOfCapturedCards = player[id].captured.length;
        if (numberOfCapturedCards === maxCaptured && numberOfCapturedCards > 0)
            scores[id] += 2;
    });

    return scores;

    function countCapturedPowerCards(playerId) {
        const capturePile = _currentState.players.byId[playerId].captured || [];
        return capturePile.filter(card => card.isPowerCard).length;
    }
}

function getTurnNumber() {
    return _currentTurn;
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
    for (let p = 0; p < numberOfPlayers; p++) {
        next = action(actionsModule.DRAW, next, { player: p });
        next = action(actionsModule.DRAW, next, { player: p });
        next = action(actionsModule.DRAW, next, { player: p });
        next = action(actionsModule.DRAW, next, { player: p });
    }
    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);
    next = action(actionsModule.REVEAL, next);

    _currentState = next;
    _currentPlayer = 0;
    _currentPhase = gameState.PLAY;
    _currentTurn = 0;
    _resetIngredientAskList();
}

function playerAddIngredientFromHandToSpell(options) {
    if (_currentPhase !== gameState.PLAY)
        return;

    const actionOptions = Object.assign({ player: _currentPlayer }, options);

    const nextState = action(actionsModule.ADD_INGREDIENT_FROM_HAND, _currentState, actionOptions);

    if (_currentState !== nextState) {
        _currentState = nextState;

        if (nextState.error) {
            console.log(`Error: ${nextState.error}`);
        }
    }

}

function playerCanTakeAction() {
    return _playerActionsRemaining > 0;
}

function playerCanTakeIngredients() {
    if (_currentPhase != gameState.PLAY)
        return false;

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
        _currentTurn++;
        _playerActionsRemaining = 1;

        if (_currentPlayer > (numberOfPlayers - 1)) {
            _currentPlayer = 0;
        }

        if (_currentState.players.byId[_currentPlayer].hand.length >= 4) {
            _currentPhase = gameState.PLAY;
        }

        _checkForGameOver();

        //this is part of the "start next turn" logic
        _resetIngredientAskList();
    }
}

function playerDone() {
    /* Currently with no checks this is like a "super pass"
     * that rockets you to directly to the discard phase.
     * This might be okay. The only problem I can think of is
     * that it would let you "un-end" a game that is over.
     */
    _currentPhase = gameState.DISCARD;
}

function playerDraw() {
    if (_currentPhase !== gameState.DRAW)
        return;

    const nextState = action(gameState.DRAW, _currentState, { player: _currentPlayer });
    _currentState = nextState;

    const cardsInPlayersHand = _currentState.players.byId[_currentPlayer].hand.length;
    const deckIsEmpty = _currentState.deck.length === 0;

    const doneDrawing = (deckIsEmpty || cardsInPlayersHand >= 4);

    if (doneDrawing) {
        _currentPhase = gameState.PLAY;
    }
}

function playerTurn(actionType, options) {
    if (_currentPhase !== gameState.PLAY)
        return;

    const actionOptions = Object.assign({ player: _currentPlayer }, options);

    if (possibleActions.includes(actionType) && playerCanTakeAction()) {
        if (actionType === playerAction.PLAY_WITCH && options && options.wash) {
            actionType = actionsModule.WITCH_COUNTERED_BY_WASH;
            actionOptions['player'] = options.wash;
            actionOptions['target'] = _currentPlayer;
        }

        const nextState = action(actionType, _currentState, actionOptions);

        const noError = !nextState.error;
        const actionSuccess = (nextState !== _currentState) || (actionType === playerAction.PASS);
        const okToTransition = (noError && actionSuccess);
        const playerHasSpellInProgress = !!nextState.players.byId[_currentPlayer].spells.length;

        if (okToTransition) {
            _currentState = nextState;
            _playerActionsRemaining--;

            if (!playerHasSpellInProgress)
                _currentPhase = gameState.DISCARD;
        }

        return nextState.error;
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
    _playerActionsRemaining = 1;
    _resetIngredientAskList();
}

function _resetIngredientAskList() {
    const allPlayerIds = Object.keys(_currentState.players.byId);
    _playersEligibleForIngredientAskThisTurn = allPlayerIds;
    _removeAskedPlayerFromEligibleList(_currentPlayer);
}

function takeIngredientFromTable(options) {
    if (_currentPhase !== gameState.PLAY)
        return;

    const actionOptions = Object.assign({ player: _currentPlayer }, options);

    const nextState = action(actionsModule.TAKE_INGREDIENT_FROM_TABLE, _currentState, actionOptions);

    if (_currentState !== nextState) {
        _currentState = nextState;

        if (nextState.error) {
            console.log(`Error: ${nextState.error}`);
        }
    }
}

module.exports = {
    askForIngredient,
    currentPhase,
    currentPlayer,
    currentState,
    DISCARD: gameState.DISCARD,
    DRAW: gameState.DRAW,
    listPlayersWhoHaveNotBeenAskedForIngredients,
    getPlayerScores,
    getTurnNumber,
    newGame,
    PLAY: gameState.PLAY,
    playerAction,
    playerAddIngredientFromHandToSpell,
    playerCanTakeAction,
    playerCanTakeIngredients,
    playerDone,
    playerDraw,
    playerDiscard,
    playerTurn,
    takeIngredientFromTable
};
