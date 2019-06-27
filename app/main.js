const actionsModule = require('./actions.js');
const gameState = require('./gameState.js');

let action = actionsModule.act;
let _currentState = null;
let _currentPlayer = null;
let _currentPhase = gameState.SETUP;
let _currentTurn = 0;
let _playerActionsRemaining = 1;
let _playersEligibleForIngredientAskThisTurn = [];

const playerAction = Object.assign({ DONE: 'Done' }, actionsModule);
delete playerAction.act;

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
            console.log(`Error asking for ingredient: Player ${options.player} does not have ${options.cardName}`);
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

function getValidActions() {
    const player = _currentState.players.byId[_currentPlayer];

    const actions = [];

    if (playerCanTakeAction()) {
        actions.push(actionsModule.CAPTURE);

        if (playerHasBlackCat())
            actions.push(actionsModule.BLACK_CAT);

        if (playerHasASpell())
            actions.push(actionsModule.SPELL);

        if (playerHasAWitch())
            actions.push(actionsModule.WITCH);

        if (playerHasWitchWash())
            actions.push(actionsModule.WITCH_WASH);

        actions.push(actionsModule.PASS);
    }
    else {
        actions.push('Done');
    }

    if (playerHasSpellInProgress()) {
        if (player.hand.length > 0)
            actions.push('Add Ingredient');

        if (_currentState.table.length > 0)
            actions.push('Take Ingredient');

        if (listPlayersWhoHaveNotBeenAskedForIngredients().length > 0)
            actions.push('Ask for Ingredient');
    }

    return actions;


    function playerHasBlackCat() {
        return !!(player.hand.find(card => card.name === 'Black Cat'));
    }

    function playerHasASpell() {
        return !!(player.hand.find(card => card.isSpell));
    }

    function playerHasAWitch() {
        return !!(player.hand.find(card => card.name === 'Witch'));
    }

    function playerHasWitchWash() {
        return !!(player.hand.find(card => card.name === 'Witch Wash'));
    }
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

    const thereAreAnyPlayersToAsk = _playersEligibleForIngredientAskThisTurn.length > 0;
    const thereAreAnyCardsOnTable = _currentState.table.length > 0;

    return (playerHasSpellInProgress() && (thereAreAnyPlayersToAsk || thereAreAnyCardsOnTable));
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

function playerHasSpellInProgress() {
    const numberOfSpellsInProgress = _currentState.players.byId[_currentPlayer].spells.length;
    return numberOfSpellsInProgress > 0;
}

function playerTurn(actionType, options) {
    if (_currentPhase !== gameState.PLAY)
        return;

    const actionOptions = Object.assign({ player: _currentPlayer }, options);

    if (playerCanTakeAction()) {
        if (actionType === actionsModule.WITCH && options && options.wash) {
            actionType = actionsModule.WITCH_COUNTERED_BY_WASH;
            actionOptions['player'] = options.wash;
            actionOptions['target'] = _currentPlayer;
        }

        const nextState = action(actionType, _currentState, actionOptions);

        if (nextState.error)
            console.log(`ERROR in playerTurn: ${nextState.error}`);

        const noError = (!nextState.error || actionType === actionsModule.PASS);
        const actionSuccess = (nextState !== _currentState) || (actionType === actionsModule.PASS);
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
    getValidActions,
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
