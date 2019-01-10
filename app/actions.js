'use strict';

var deepFreeze = require('deep-freeze');

const BLACK_CAT = 'BLACK_CAT';
const CAPTURE = 'CAPTURE';
const DISCARD = 'DISCARD';
const DRAW = 'DRAW';
const REVEAL = 'REVEAL';

function act(actionType, currentState, options) {
    deepFreeze(currentState);

    const newState = {
        deck: currentState.deck.slice(),
        table: currentState.table.slice(),
        players: copyPlayers(currentState.players)
    };

    const player = optionsDefined('player') ? newState.players.byId[options.player] : null;
    //TODO: check that target is a valid player (error or no-op?)

    if ( actionType === BLACK_CAT && optionsDefined(['player', 'target']) ) {
        const playerHasBlackCat = !!(player.hand.find(card => card.name === 'Black Cat'));

        if (!playerHasBlackCat) {
            newState.error = `Player ${options.player} does not have the Black Cat`;
            return newState;
        }

        const target = newState.players.byId[options.target];
        if (!target) {
            //TODO: check that target is a valid player (no-op because we can check in the if conditions?)
        }

        const targetHasAnyPowerCards = target.captured.find(card => card.powerCard);
        if (!targetHasAnyPowerCards) {
            newState.error = `Player ${options.target} does not have any power cards in their capture pile`;
            return newState;
        }

        const blackCatIndex = player.hand.findIndex(card => card.name === 'Black Cat');
        const firstPowerCardIndex = target.captured.findIndex(card => card.powerCard);

        player.captured.push(player.hand[blackCatIndex]);
        removeCardFrom(player.hand, blackCatIndex);
        player.captured.push(target.captured[firstPowerCardIndex]);
        removeCardFrom(target.captured, firstPowerCardIndex);
    }
    else if ( actionType === CAPTURE && optionsDefined(['player', 'cards', 'tableCards'])) {
        const playerCardIds = options['cards'];
        const tableCardIds = options['tableCards'];

        if (playerCardIds.length === 0 || tableCardIds.length === 0)
            return currentState;

        if (playerCardIds.length > 1 && tableCardIds.length > 1) {
            newState.error = 'Error, cannot use multiple cards from hand to capture multiple cards';
            return newState;
        }

        if (playerCardIds.length > 3 || tableCardIds.length > 3) {
            newState.error = 'Error, cannot use more than three cards to capture';
            return newState;
        }

        const playerCards = playerCardIds.map(cardIndex => player.hand[cardIndex]);
        const tableCards = tableCardIds.map(cardIndex => newState.table[cardIndex]);

        const allCaptureCardsAreNumeric = (playerCards.every(isNumeric) && tableCards.every(isNumeric));
        if (!allCaptureCardsAreNumeric) {
            newState.error = 'Error, cannot capture non-numeric cards';
            return newState;
        }

        const playerCardsSum = playerCards.reduce(sumCardValues, 0);
        const tableCardsSum = tableCards.reduce(sumCardValues, 0);

        if (playerCardsSum !== tableCardsSum) {
            newState.error = 'Error, capture cards are not equal'
            return newState;
        }

        player.captured = player.captured.concat(playerCards, tableCards);
        playerCardIds.forEach(cardIndex => player.hand[cardIndex] = false);
        player.hand = player.hand.filter(card => !!card);

        tableCardIds.forEach(cardIndex => newState.table[cardIndex] = false);
        newState.table = newState.table.filter(card => !!card);
    }
    else if ( actionType === DISCARD && optionsDefined(['player', 'card']) && player.hand[options.card]) {
        const cardDiscarded = player.hand[options.card];
        removeCardFrom(player.hand, options.card);
        newState.table.push(cardDiscarded);
    }
    else if ( actionType === DRAW && optionsDefined('player') ) {
        const player = newState.players.byId[options.player];
        drawCard(newState, player)
    }
    else if ( actionType === REVEAL && newState.deck.length ) {
        revealCard(newState);
    }
    else {
        return currentState;
    }

    return newState;


    function optionsDefined(args) {
        if (typeof options === 'undefined')
            return false;
        if (typeof args === 'string')
            return args in options;
        else if (Array.isArray(args))
            return args.every(key => key in options);
        else
            return false;
    }
}

function removeCardFrom(location, index) {
    if ('splice' in location)
        location.splice(index, 1);
}

function takeRandomCardFromDeck(deck) {
    const currentDeckSize = deck.length;
    const randomCardIndex = Math.floor(Math.random()*currentDeckSize);
    const cardDrawn = deck[randomCardIndex];
    removeCardFrom(deck, randomCardIndex);

    return cardDrawn;
}

function drawCard(state, player) {
    const card = takeRandomCardFromDeck(state.deck);
    player.hand.push(card);
}

function revealCard(state) {
    const card = takeRandomCardFromDeck(state.deck);
    state.table.push(card);
}




function copyPlayers(currentPlayers) {
    const result = {
        byId: {}
    };

    const allPlayerIds = Object.keys(currentPlayers.byId);
    allPlayerIds.forEach(id => {
        result.byId[id] = Object.assign({}, currentPlayers.byId[id]);
        result.byId[id].hand = currentPlayers.byId[id].hand.slice();
        result.byId[id].captured = currentPlayers.byId[id].captured.slice();
    });

    return result;
}

function isNumeric(card) {
    return card && card.numericValue && typeof card.numericValue === 'number';
}

function sumCardValues(total, nextCard) {
    return total + nextCard.numericValue;
}

module.exports = {
    act,
    BLACK_CAT,
    CAPTURE,
    DISCARD,
    DRAW,
    REVEAL
}
