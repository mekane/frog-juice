'use strict';

var deepFreeze = require('deep-freeze');

const BLACK_CAT = 'BLACK_CAT';
const CAPTURE = 'CAPTURE';
const DISCARD = 'DISCARD';
const DRAW = 'DRAW';
const PLAY_SPELL = 'PLAY_SPELL';
const REVEAL = 'REVEAL';
const WITCH = 'WITCH';
const WITCH_WASH = 'WITCH_WASH';
const WITCH_COUNTERED_BY_WASH = 'WITCH_COUNTERED_BY_WASH';

function act(actionType, currentState, options) {
    deepFreeze(currentState);

    const newState = {
        deck: currentState.deck.slice(),
        table: currentState.table.slice(),
        players: copyPlayers(currentState.players)
    };

    const player = optionsDefined('player') ? newState.players.byId[options.player] : null;
    //TODO: check that target is a valid player (error or no-op?)

    if (actionType === BLACK_CAT && optionsDefined(['player', 'target'])) {
        if (!hasCard(player, 'Black Cat')) {
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

        captureCardFromHand(player, 'Black Cat');

        const firstPowerCardIndex = target.captured.findIndex(card => card.powerCard);
        player.captured.push(target.captured[firstPowerCardIndex]);
        removeCardFrom(target.captured, firstPowerCardIndex);
    }
    else if (actionType === CAPTURE && optionsDefined(['player', 'cards', 'tableCards'])) {
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
    else if (actionType === DISCARD && optionsDefined(['player', 'card']) && player.hand[options.card]) {
        const cardDiscarded = player.hand[options.card];
        removeCardFrom(player.hand, options.card);
        newState.table.push(cardDiscarded);
    }
    else if (actionType === DRAW && optionsDefined('player')) {
        const player = newState.players.byId[options.player];
        drawCard(newState, player)
    }
    else if (actionType === PLAY_SPELL && optionsDefined(['player', 'card'])) {
        const card = player.hand[options.card];
        if (!card || !card.isSpell) {
            newState.error = `Card specified (${card.name}) is not a spell`;
            return newState;
        }

        player.spells.push(card);
        removeCardFrom(player.hand, options.card);
    }
    else if (actionType === REVEAL && newState.deck.length) {
        revealCard(newState);
    }
    else if (actionType === WITCH && optionsDefined(['player'])) {
        if (!hasCard(player, 'Witch')) {
            newState.error = `Player ${options.player} does not have a Witch`;
            return newState;
        }

        captureCardFromHand(player, 'Witch');
        sweepTheTableIntoPlayersCapturePile();
    }
    else if (actionType === WITCH_WASH && optionsDefined(['player'])) {
        if (!hasCard(player, 'Witch Wash')) {
            newState.error = `Player ${options.player} does not have the Witch Wash`;
            return newState;
        }

        const anyWitchesOnTheTable = !!(newState.table.find(card => card.name === 'Witch'));
        if (!anyWitchesOnTheTable) {
            newState.error = `There are no Witches to Wash`;
            return newState;
        }

        captureCardFromHand(player, 'Witch Wash');

        const witchIndex = newState.table.findIndex(card => card.name === 'Witch');
        player.captured.push(newState.table[witchIndex]);
        removeCardFrom(newState.table, witchIndex);
    }
    else if (actionType === WITCH_COUNTERED_BY_WASH && optionsDefined(['player', 'target'])) {
        const target = newState.players.byId[options.target];

        if (!hasCard(player, 'Witch Wash')) {
            newState.error = `Player ${options.player} does not have the Witch Wash`;
            return newState;
        }

        if (!hasCard(target, 'Witch')) {
            newState.error = `Player ${options.target} does not have a Witch`;
            return newState;
        }

        captureCardFromHand(player, 'Witch Wash');

        //move witch from target's hand to player's capture pile
        const witchIndex = target.hand.findIndex(card => card.name === 'Witch');
        player.captured.push(target.hand[witchIndex]);
        removeCardFrom(target.hand, witchIndex);

        sweepTheTableIntoPlayersCapturePile();
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

    function sweepTheTableIntoPlayersCapturePile() {
        player.captured = player.captured.concat(newState.table);
        newState.table = [];
    }
}

function hasCard(player, cardName) {
    return !!(player.hand.find(card => card.name === cardName));
}

function captureCardFromHand(player, cardName) {
    const index = player.hand.findIndex(card => card.name === cardName);
    if (index !== -1) {
        player.captured.push(player.hand[index]);
        removeCardFrom(player.hand, index);
    }
}

function removeCardFrom(location, index) {
    if ('splice' in location)
        location.splice(index, 1);
}

function takeRandomCardFromDeck(deck) {
    const currentDeckSize = deck.length;
    const randomCardIndex = Math.floor(Math.random() * currentDeckSize);
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
        result.byId[id].spells = currentPlayers.byId[id].spells.slice();
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
    PLAY_SPELL,
    REVEAL,
    WITCH,
    WITCH_WASH,
    WITCH_COUNTERED_BY_WASH
};
