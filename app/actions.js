'use strict';

var deepFreeze = require('deep-freeze');

const ADD_INGREDIENT_FROM_HAND = 'Add Ingredient';
const BLACK_CAT = 'Black Cat';
const CAPTURE = 'Capture';
const DISCARD = 'DISCARD';
const DRAW = 'DRAW';
const PASS = 'Pass';
const REVEAL = 'Reveal';
const SPELL = 'Play Spell';
const TAKE_INGREDIENT_FROM_PLAYER = 'Ask for Ingredient';
const TAKE_INGREDIENT_FROM_TABLE = 'Take Ingredient';
const WITCH = 'Witch';
const WITCH_WASH = 'Witch Wash';
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

    if (actionType === ADD_INGREDIENT_FROM_HAND && optionsDefined(['player', 'card'])) {
        const card = player.hand[options.card];

        let cardNeeded = false;
        player.spells.forEach(spell => {
            cardNeeded = cardNeeded || !!spellRequiresIngredient(spell, card.name);
        });
        if (!cardNeeded) {
            newState.error = `The specified card (${card.name}) is not an ingredient of any spells`;
            return newState;
        }

        const playerAlreadyHasIngredient = player.ingredients.find(c => c.name === card.name);
        if (playerAlreadyHasIngredient) {
            newState.error = `The specified card (${card.name}) is already added to a spell`;
            return newState;
        }

        removeCardFrom(player.hand, options.card);
        player.ingredients.push(card);

        player.spells.forEach(spell => {
            if (spellIsComplete(player, spell))
                captureSpellAndIngredients(player, spell);
        });
    }
    else if (actionType === BLACK_CAT && optionsDefined(['player', 'target'])) {
        if (!hasCard(player, 'Black Cat')) {
            newState.error = `Player ${options.player} does not have the Black Cat`;
            return newState;
        }

        const target = newState.players.byId[options.target];
        if (!target) {
            //TODO: check that target is a valid player (no-op because we can check in the if conditions?)
        }

        const targetHasAnyPowerCards = target.captured.find(card => card.isPowerCard);
        if (!targetHasAnyPowerCards) {
            newState.error = `Player ${options.target} does not have any power cards in their capture pile`;
            return newState;
        }

        captureCardFromHand(player, 'Black Cat');

        const firstPowerCardIndex = target.captured.findIndex(card => card.isPowerCard);
        player.captured.push(target.captured[firstPowerCardIndex]);
        removeCardFrom(target.captured, firstPowerCardIndex);
    }
    else if (actionType === CAPTURE && optionsDefined(['player', 'cards', 'tableCards'])) {
        const playerCardIds = removeDuplicatesFromArray(options['cards']);
        const tableCardIds = removeDuplicatesFromArray(options['tableCards']);

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
    else if (actionType === DRAW && optionsDefined('player') && currentState.deck.length) {
        const player = newState.players.byId[options.player];
        drawCard(newState, player)
    }
    else if (actionType === SPELL && optionsDefined(['player', 'card'])) {
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
    else if (actionType === TAKE_INGREDIENT_FROM_PLAYER && optionsDefined(['player', 'target', 'cardName'])) {
        const targetPlayer = newState.players.byId[options.target];
        if (!hasCard(targetPlayer, options.cardName)) {
            newState.error = `The player does not have the named card (${options.cardName})`;
            return newState;
        }

        const cardIndex = targetPlayer.hand.findIndex(card => card.name === options.cardName);
        const card = targetPlayer.hand[cardIndex];

        let cardNeeded = false;
        player.spells.forEach(spell => {
            cardNeeded = cardNeeded || !!spellRequiresIngredient(spell, card.name);
        });
        if (!cardNeeded) {
            newState.error = `The specified card (${card.name}) is not an ingredient of any spells`;
            return newState;
        }

        const playerAlreadyHasIngredient = player.ingredients.find(c => c.name === card.name);
        if (playerAlreadyHasIngredient) {
            newState.error = `The specified card (${card.name}) is already added to a spell`;
            return newState;
        }

        removeCardFrom(targetPlayer.hand, cardIndex);
        player.ingredients.push(card);

        player.spells.forEach(spell => {
            if (spellIsComplete(player, spell))
                captureSpellAndIngredients(player, spell);
        });
    }
    else if (actionType === TAKE_INGREDIENT_FROM_TABLE && optionsDefined(['player', 'card'])) {
        const card = newState.table[options.card];

        let cardNeeded = false;
        player.spells.forEach(spell => {
            cardNeeded = cardNeeded || !!spellRequiresIngredient(spell, card.name);
        });
        if (!cardNeeded) {
            newState.error = `The specified card (${card.name}) is not an ingredient of any spells`;
            return newState;
        }

        const playerAlreadyHasIngredient = player.ingredients.find(c => c.name === card.name);
        if (playerAlreadyHasIngredient) {
            newState.error = `The specified card (${card.name}) is already added to a spell`;
            return newState;
        }

        removeCardFrom(newState.table, options.card);
        player.ingredients.push(card);

        player.spells.forEach(spell => {
            if (spellIsComplete(player, spell))
                captureSpellAndIngredients(player, spell);
        });
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

        const players = Object.keys(newState.players.byId).map(playerId => newState.players.byId[playerId]);
        players.forEach(target => {
            player.captured = player.captured.concat(target.spells);
            target.spells = [];
            player.captured = player.captured.concat(target.ingredients);
            target.ingredients = [];
        });
    }
}

function hasCard(player, cardName) {
    return !!(player.hand.find(card => card.name === cardName));
}

function spellRequiresIngredient(spell, ingredientName) {
    return spell && (spell.ingredients.find(cardName => cardName === ingredientName));
}

function spellIsComplete(player, spell) {
    if (!spell)
        return false;

    return spell.ingredients.every(playerHasIngredient);

    function playerHasIngredient(ingredientName) {
        return player.ingredients.find(card => card.name === ingredientName);
    }
}

function captureSpellAndIngredients(player, spell) {
    player.captured.push(spell);
    removeCardFrom(player.spells, spell);

    const captureIngredient = name => captureCardFromIngredients(player, name);
    spell.ingredients.forEach(captureIngredient);
}

function captureCardFromIngredients(player, cardName) {
    const index = player.ingredients.findIndex(card => card.name === cardName);
    if (index !== -1) {
        player.captured.push(player.ingredients[index]);
        removeCardFrom(player.ingredients, index);
    }
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
    const card = state.deck.shift();
    player.hand.push(card);
}

function revealCard(state) {
    const card = takeRandomCardFromDeck(state.deck);
    //const card = state.deck.shift();
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
        result.byId[id].ingredients = currentPlayers.byId[id].ingredients.slice();
    });

    return result;
}

function isNumeric(card) {
    return card && card.numericValue && typeof card.numericValue === 'number';
}

function sumCardValues(total, nextCard) {
    return total + nextCard.numericValue;
}

function removeDuplicatesFromArray(array) {
    return Array.from(new Set(array));
}

module.exports = {
    ADD_INGREDIENT_FROM_HAND,
    act,
    BLACK_CAT,
    CAPTURE,
    DISCARD,
    DRAW,
    PASS,
    SPELL,
    REVEAL,
    TAKE_INGREDIENT_FROM_PLAYER,
    TAKE_INGREDIENT_FROM_TABLE,
    WITCH,
    WITCH_WASH,
    WITCH_COUNTERED_BY_WASH
};
