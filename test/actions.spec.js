const expect = require('chai').expect;
const app = require('../app/app.js');
const actions = require('../app/actions.js');

describe('The action function', () => {
    it('takes an action string, the current game state, and optional data and returns a new state', () => {
        const state = app.newGame();
        const newState = actions.act('TEST', state, {});
        expect(state).to.not.equal(newState);
    });

    //it('returns the original state on unknown action types')
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

    });
});

describe('the capture action', () => {
    //one-for-one
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
