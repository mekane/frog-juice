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
    it('does nothing if no player is specified', () => {
        const state = app.newGame();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.DRAW, state, {});

        const expectedDeckSize = originalDeckSize;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.players.byId[0].hand.length).to.equal(0);
    });

    it("moves a random card from the deck array to the specified player's hand", () => {
        const state = app.newGame();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.DRAW, state, {player: 0});

        const expectedDeckSize = originalDeckSize - 1;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.players.byId[0].hand.length).to.equal(1);
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
        const originalState = app.newGame();

        const nextState = actions.act(actions.DISCARD, originalState, {player:0, card:1});

        expect(nextState).to.equal(originalState);
    });

    it("moves the card at the specified index from the player's hand to the table", () => {
        const originalState = app.newGame();
        const stateAfterPlayerDrawsOne = actions.act(actions.DRAW, originalState, {player: 0});

        const nextState = actions.act(actions.DISCARD, stateAfterPlayerDrawsOne, {player:0, card: 0});

        const playerHasNoCardsInHand = (nextState.players.byId[0].hand.length === 0);
        const thereIsOneCardOnTheTable = (nextState.table.length === 1);
        expect(playerHasNoCardsInHand, 'Player has no cards in hand after discarding').to.be.true;
        expect(thereIsOneCardOnTheTable, 'There is one card on the table after player discards').to.be.true;
    });
});

describe('the capture action', () => {
    it('does nothing if no player is specified', () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.CAPTURE, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if a player is specified but no card(s) are specified', () => {
        const originalState = app.newGame();

        const nextState = actions.act(actions.CAPTURE, originalState, {player:0});
        expect(nextState).to.equal(originalState);

        const anotherState = actions.act(actions.CAPTURE, originalState, {player:0, cards: []});
        expect(anotherState).to.equal(originalState);
    });

    it('does nothing if a player and hand cards are specified but no table card(s) are specified', () => {
        const originalState = app.newGame();

        const nextState = actions.act(actions.CAPTURE, originalState, {player:0, cards: [1]});
        expect(nextState).to.equal(originalState);

        const anotherState = actions.act(actions.CAPTURE, originalState, {player:0, cards: [1], tableCards: []});
        expect(anotherState).to.equal(originalState);
    });

    it('does nothing if a player and table cards are specified but no hand card(s) are specified', () => {
        const originalState = app.newGame();

        const nextState = actions.act(actions.CAPTURE, originalState, {player:0, tableCards: [1]});
        expect(nextState).to.equal(originalState);

        const anotherState = actions.act(actions.CAPTURE, originalState, {player:0, cards: [], tableCards: [1]});
        expect(anotherState).to.equal(originalState);
    });

    it(`produces an error state if you try to specify multiple cards for both player and table cards`, () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0,1], tableCards: [0,1]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot use multiple cards from hand to capture multiple cards');
    });

    it(`produces an error state if you try to use more than three hand cards to capture`, () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0,1,2,3], tableCards: [0]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot use more than three cards to capture');
    });

    it(`produces an error state if you try to capture more than three cards`, () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0], tableCards: [0,1,2,3]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot use more than three cards to capture');
    });

    it(`produces an error state if you try to capture a non-numeric card from the table`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Shrinking Brew',
                numericValue: 1,
                isPowerCard: false
            }
        ];
        originalState.table = [
            {
                name: 'Witch',
                numericValue: null,
                isPowerCard: true
            }
        ]

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0], tableCards: [0]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot capture non-numeric cards');
    });

    it(`produces an error state if you try to capture a non-numeric card from your hand`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Witch',
                numericValue: null,
                isPowerCard: true
            }
        ];
        originalState.table = [
             {
                name: 'Shrinking Brew',
                numericValue: 1,
                isPowerCard: false
            }
        ]

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0], tableCards: [0]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot capture non-numeric cards');
    });

    it(`produces an error state if you try to use one-and-one of different values`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Shrinking Brew',
                numericValue: 1,
                isPowerCard: false
            }
        ];
        originalState.table = [
             {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            }
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0], tableCards: [0]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, capture cards are not equal');
    });

    it(`produces an error state if the player card doesn't add up to the value of the table cards`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Shrinking Brew',
                numericValue: 1,
                isPowerCard: false
            }
        ];
        originalState.table = [
             {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            },
            {
                name: 'Toads',
                numericValue: 3,
                isPowerCard: false
            }
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0], tableCards: [0,1]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, capture cards are not equal');
    });

    it(`produces an error state if the player cards don't add up to the value of the table card`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Shrinking Brew',
                numericValue: 1,
                isPowerCard: false
            },
            {
            name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            }
        ];
        originalState.table = [
            {
                name: 'Toads',
                numericValue: 4,
                isPowerCard: false
            }
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0,1], tableCards: [0]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, capture cards are not equal');
    });

    it(`takes a player, a card from their hand, and a card from the table and puts them in the capture pile`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            }
        ];
        originalState.table = [
             {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            }
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0], tableCards: [0]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.table.length, 'No cards left on table').to.equal(0);
        expect(nextState.players.byId[0].hand.length, 'No cards left in hand').to.equal(0);
        expect(nextState.players.byId[0].captured.length, 'Two cards in capture pile').to.equal(2);
    });

    it(`takes a player, multiple cards from their hand, and a card from the table and puts them in the capture pile`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            },
            {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            }
        ];
        originalState.table = [
            {
                name: 'Newts',
                numericValue: 4,
                isPowerCard: false
            }
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0,1], tableCards: [0]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.table.length, 'No cards left on table').to.equal(0);
        expect(nextState.players.byId[0].hand.length, 'No cards left in hand').to.equal(0);
        expect(nextState.players.byId[0].captured.length, 'Three cards in capture pile').to.equal(3);
    });

    it(`takes a player, a card from their hand, and multiple cards from the table and puts them in the capture pile`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Frog Juice',
                numericValue: 6,
                isPowerCard: false
            }
        ];
        originalState.table = [
            {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            },
            {
                name: 'Newts',
                numericValue: 4,
                isPowerCard: false
            }
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [0], tableCards: [0,1]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.table.length, 'No cards left on table').to.equal(0);
        expect(nextState.players.byId[0].hand.length, 'No cards left in hand').to.equal(0);
        expect(nextState.players.byId[0].captured.length, 'Three cards in capture pile').to.equal(3);
    });

    it(`preserves other data when capturing`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Shrinking Brew',
                numericValue: 1,
                isPowerCard: false
            },
            {
                name: 'Frog Juice',
                numericValue: 6,
                isPowerCard: false
            }
        ];
        originalState.table = [
            {
                name: 'Witch',
                numericValue: null,
                isPowerCard: true
            },
            {
                name: 'Shrinking Brew',
                numericValue: 1,
                isPowerCard: false
            },
            {
                name: 'Bats',
                numericValue: 2,
                isPowerCard: false
            },
            {
                name: 'Toads',
                numericValue: 3,
                isPowerCard: false
            },
            {
                name: 'Newts',
                numericValue: 4,
                isPowerCard: false
            },
            {
                name: 'Mice',
                numericValue: 5,
                isPowerCard: false
            }
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, {player: 0, cards: [1], tableCards: [1,2,3]});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.table.length, 'Three cards left on table').to.equal(3);
        expect(nextState.table[0].name).to.equal('Witch');
        expect(nextState.table[1].name).to.equal('Newts');
        expect(nextState.players.byId[0].hand.length, 'One card left in hand').to.equal(1);
        expect(nextState.players.byId[0].hand[0].name).to.equal('Shrinking Brew');
        expect(nextState.players.byId[0].captured.length, 'Four cards in capture pile').to.equal(4);
    });
});

describe('the black cat action', () => {
    it(`does nothing if no player is specified`, () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.BLACK_CAT, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no target is specified`, () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.BLACK_CAT, originalState, {player: 0});

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the specified player doesn't have the Black Cat card in hand`, () => {
        const originalState = app.newGame();
        const nextState = actions.act(actions.BLACK_CAT, originalState, {player: 0, target: 1});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 0 does not have the Black Cat');
    });

    it(`produces an error state if the target player has no power cards in their capture pile`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Black Cat',
                numericValue: null,
                powerCard: true
            }
        ];

        const nextState = actions.act(actions.BLACK_CAT, originalState, {player: 0, target: 1});

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 1 does not have any power cards in their capture pile');
    });

    it(`transfers a power card from the target player's capture pile to the player's pile`, () => {
        const originalState = app.newGame();
        originalState.players.byId[0].hand = [
            {
                name: 'Black Cat',
                numericValue: null,
                powerCard: true
            }
        ];
        originalState.players.byId[0].captured = [
            {
                name: 'Bats',
                numericValue: 2,
                powerCard: false
            }
        ];
        originalState.players.byId[1].captured = [
            {
                name: 'Witch',
                numericValue: null,
                powerCard: true
            },
            {
                name: 'Toads',
                numericValue: 3,
                powerCard: false
            }
        ];

        const nextState = actions.act(actions.BLACK_CAT, originalState, {player: 0, target: 1});

        const player = nextState.players.byId[0];
        const playerCapturedBlackCat = !!(player.captured.find(card => card.name === 'Black Cat'));
        const numberOfCapturedPowerCards = player.captured.filter(card => !!card.powerCard).length;
        const target = nextState.players.byId[1];
        const targetCapturedPowerCards = target.captured.filter(card => !!card.powerCard).length;

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.be.an('undefined');

        expect(playerCapturedBlackCat, 'player 0 captured the Black Cat').to.be.true;
        expect(player.captured.length, 'player captures Black Cat and one power card').to.equal(3);
        expect(numberOfCapturedPowerCards, 'player gains two power cards').to.equal(2);

        expect(target.captured.length, 'target loses a captured power card').to.equal(1);
        expect(targetCapturedPowerCards, 'target loses a power card').to.equal(0)
    });
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
