'use strict';
const DISCARD = 'DISCARD';
const DRAW = 'DRAW';
const REVEAL = 'REVEAL';

function act(actionType, currentState, options) {

    const newState = {
        deck: currentState.deck.slice(),
        table: currentState.table.slice(),
        players: copyPlayers(currentState.players)
    };

    if ( actionType === DISCARD && 'player' in options && 'card' in options ) {
        const player = newState.players.byId[options.player];
        const cardDiscarded = player.hand[options.card];
        newState.players.byId[options.player].hand.splice(options.card, 1);
        newState.table.push(cardDiscarded);
    }
    else if ( actionType === DRAW && 'player' in options ) {
        newState.players.byId[options.player].hand.push(drawCard());
    }
    else if ( actionType === REVEAL ) {
        newState.table.push(drawCard());
    }
    else {
        return currentState;
    }

    return newState;

    function drawCard() {
        const currentDeckSize = newState.deck.length;
        const randomCardIndex = Math.floor(Math.random()*currentDeckSize);
        const cardDrawn = newState.deck[randomCardIndex];
        newState.deck[randomCardIndex] = false;
        newState.deck = newState.deck.filter(card => card !== false);

        return cardDrawn;
    }
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
