const expect = require('chai').expect;
const app = require('../app/app.js');
const actions = require('../app/actions.js');

describe('The action function', () => {
    it('takes an action string, the current game state, and optional data and returns a new state', () => {
        const state = app.newGame();
        const newState = actions.act(actions.REVEAL, state, {});
        expect(state).to.not.equal(newState);
    });

    it('returns the original state on unknown action types', () => {
        const state = app.newGame();
        const newState = actions.act('BOGUS', state, {});
        expect(state).to.equal(newState);
    });
});

describe('the draw action', () => {
    it("moves a random card from the deck array to the specified player's hand", () => {
        const state = app.newGame();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.DRAW, state, {player: 0});

        const expectedDeckSize = originalDeckSize - 1;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.players.byId[0].hand.length).to.equal(1);
    });

    it('does nothing if no player is specified', () => {
        const state = app.newGame();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.DRAW, state, {});

        const expectedDeckSize = originalDeckSize;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.players.byId[0].hand.length).to.equal(0);
    });
});

describe('the reveal action', () => {
    it(`does nothing if the deck is empty`, () => {
        const state = app.newGame();
        state.deck = [];

        const newState = actions.act(actions.REVEAL, state);

        expect(newState).to.equal(state);
    });

    it("draws a card from the deck and adds it to the table row", () => {
        const state = app.newGame();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.REVEAL, state);

        const expectedDeckSize = originalDeckSize - 1;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.table.length).to.equal(1);
    });
});

describe('the discard action', () => {
    it("moves the card at the specified index from the player's hand to the table", () => {
        const originalState = app.newGame();
        const stateAfterPlayerDrawsOne = actions.act(actions.DRAW, originalState, {player: 0});

        const nextState = actions.act(actions.DISCARD, stateAfterPlayerDrawsOne, {player:0, card: 0});

        const playerHasNoCardsInHand = (nextState.players.byId[0].hand.length === 0);
        const thereIsOneCardOnTheTable = (nextState.table.length === 1);
        expect(playerHasNoCardsInHand, 'Player has no cards in hand after discarding').to.be.true;
        expect(thereIsOneCardOnTheTable, 'There is one card on the table after player discards').to.be.true;
    });

    it('does nothing if no player is specified', () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.DISCARD, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if a player is specified but no card is specified', () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.DISCARD, originalState, {player:0});

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if a player and card are specified but there are not enough cards in the hand`, () => {

    });
});

describe('the capture action', () => {
    it('does nothing if no player is specified', () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.DISCARD, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if a player is specified but no card(s) are specified', () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.DISCARD, originalState, {player:0});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if a player and hand cards are specified but no table card(s) are specified', () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.DISCARD, originalState, {player:0, cards: [1]});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if a player and table cards are specified but no hand card(s) are specified', () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.DISCARD, originalState, {player:0, tableCards: [1]});

        expect(nextState).to.equal(originalState);
    });

    //it(`does an error state if you try to use non-numeric cards`, () => {

    //it(`does an error state if you try to use one-and-one of different values`, () => {

    it(`takes a player, a card from their hand, and a card from the table and puts them in the capture pile`, () => {

    });

    //it(`does an error state if you try to specify multiple cards for both player and table cards`, () => {

    //it(`does an error state if the multi-cards don't add up to the value of the single card`, () => {

    //two-or-three from hand to one on table
    //one from hand for two-or-three on table
});

describe('the black cat action', () => {

});

describe('the witch action', () => {

});

describe('the witch wash action (as action on turn)', () => {

});

describe('the witch-countered-by-witch-wash action', () => {
    /* I imagine the UI will have to query the player holding the Witch Wash
       whenever a Witch is played, and if they want to use it then this action
       will be the final result. It will contain the player that tried to use the
       witch as well as the player who countered, and will result in the countering
       player sweeping all the cards
   */
});

describe('the play spell action', () => {
    //I think this just adds the spell from their hand to their "spellInProgress" list
    //Taking ingredients from the table and asking for ingredients should each be their own actions
});

describe("taking an ingredient from the table to add to a player's spell", () => {

});

describe('taking a spell component from another player and adding it to a spell', () => {

});
