'use strict';
const DRAW = 'DRAW';

function act(actionType, currentState, options) {

    let deck = currentState.deck.slice();
    const players = copyPlayers(currentState.players);
    const currentDeckSize = deck.length;

    if ( actionType === DRAW && 'player' in options ) {
        const randomCardIndex = Math.floor(Math.random()*currentDeckSize);
        const cardDrawn = deck[randomCardIndex];
        deck[randomCardIndex] = false;
        deck = deck.filter(card => card !== false);

        players.byId[options.player].hand.push(cardDrawn);
    }

    return {
        deck,
        players
    };
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
    DRAW
}
