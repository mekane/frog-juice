'use strict';

var deepFreeze = require('deep-freeze');

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

    if ( actionType === DISCARD && optionsDefined(['player', 'card']) ) {
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

module.exports = {
    act,
    DISCARD,
    DRAW,
    REVEAL
}
