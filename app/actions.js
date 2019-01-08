'use strict';
const DISCARD = 'DISCARD';
const DRAW = 'DRAW';
const REVEAL = 'REVEAL';

function act(actionType, currentState, options) {

    let deck = currentState.deck.slice();
    let table = currentState.table.slice();
    const players = copyPlayers(currentState.players);
    const currentDeckSize = deck.length;

    if ( actionType === DRAW && 'player' in options ) {
        players.byId[options.player].hand.push(drawCard());
    }

    if ( actionType === REVEAL ) {
        table.push(drawCard());
    }

    return {
        deck,
        table,
        players
    };

    function drawCard() {
        const randomCardIndex = Math.floor(Math.random()*currentDeckSize);
        const cardDrawn = deck[randomCardIndex];
        deck[randomCardIndex] = false;
        deck = deck.filter(card => card !== false);

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
