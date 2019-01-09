'use strict';

var deepFreeze = require('deep-freeze');

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

    if ( actionType === CAPTURE && optionsDefined(['player', 'cards', 'tableCards'])) {
        const playerCardIds = options['cards'];
        const tableCardIds = options['tableCards'];

        if (playerCardIds.length === 0 || tableCardIds.length === 0)
            return currentState;

        if (playerCardIds.length > 1 && tableCardIds.length > 1) {
            newState.error = 'Error, cannot capture use multiple cards from hand to capture multiple cards';
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

        console.log(`capturing ${tableCardsSum} using ${playerCardsSum}`);

        if (playerCardsSum !== tableCardsSum) {
            newState.error = 'Error, capture cards are not equal'
            return newState;
        }

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
    CAPTURE,
    DISCARD,
    DRAW,
    REVEAL
}
