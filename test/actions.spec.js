const expect = require('chai').expect;
const gameState = require('../app/gameState.js');
const actions = require('../app/actions.js');

const bats = gameState.bats;
const blackCat = gameState.blackCat;
const frogJuice = gameState.frogJuice;
const mice = gameState.mice;
const newts = gameState.newts;
const prince = gameState.prince;
const princeToFrogSpell = gameState.princeToFrogSpell;
const shrinkingBrew = gameState.shrinkingBrew;
const toads = gameState.toads;
const uglifyingSpell = gameState.uglifyingSpell;
const witch = gameState.witch;
const witchWash = gameState.witchWash;

describe('The action function', () => {
    it('takes an action string, the current game state, and optional data and returns a new state', () => {
        const state = gameState.initialState();
        const newState = actions.act(actions.REVEAL, state, {});
        expect(state).to.not.equal(newState);
    });

    it('returns the original state on unknown action types', () => {
        const state = gameState.initialState();
        const newState = actions.act('BOGUS', state, {});
        expect(state).to.equal(newState);
    });
});

describe('the draw action', () => {
    it('does nothing if no player is specified', () => {
        const state = gameState.initialState();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.DRAW, state, {});

        const expectedDeckSize = originalDeckSize;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.players.byId[0].hand.length).to.equal(0);
    });

    it("moves a random card from the deck array to the specified player's hand", () => {
        const state = gameState.initialState();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.DRAW, state, { player: 0 });

        const expectedDeckSize = originalDeckSize - 1;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.players.byId[0].hand.length).to.equal(1);
    });

});

describe('the reveal action', () => {
    it(`does nothing if the deck is empty`, () => {
        const state = gameState.initialState();
        state.deck = [];

        const newState = actions.act(actions.REVEAL, state);

        expect(newState).to.equal(state);
    });

    it("draws a card from the deck and adds it to the table row", () => {
        const state = gameState.initialState();
        const originalDeckSize = state.deck.length;

        const newState = actions.act(actions.REVEAL, state);

        const expectedDeckSize = originalDeckSize - 1;

        expect(newState.deck.length).to.equal(expectedDeckSize);
        expect(newState.table.length).to.equal(1);
    });
});

describe('the discard action', () => {
    it('does nothing if no player is specified', () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.DISCARD, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if a player is specified but no card is specified', () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.DISCARD, originalState, { player: 0 });

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if a player and card are specified but there are not enough cards in the hand`, () => {
        const originalState = gameState.initialState();

        const nextState = actions.act(actions.DISCARD, originalState, { player: 0, card: 1 });

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if a player and card are specified but the card index is invalid`, () => {
        const originalState = gameState.initialState();

        const nextState = actions.act(actions.DISCARD, originalState, { player: 0, card: -1 });

        expect(nextState).to.equal(originalState);
    });

    it("moves the card at the specified index from the player's hand to the table", () => {
        const originalState = gameState.initialState();
        const stateAfterPlayerDrawsOne = actions.act(actions.DRAW, originalState, { player: 0 });

        const nextState = actions.act(actions.DISCARD, stateAfterPlayerDrawsOne, { player: 0, card: 0 });

        const playerHasNoCardsInHand = (nextState.players.byId[0].hand.length === 0);
        const thereIsOneCardOnTheTable = (nextState.table.length === 1);
        expect(playerHasNoCardsInHand, 'Player has no cards in hand after discarding').to.be.true;
        expect(thereIsOneCardOnTheTable, 'There is one card on the table after player discards').to.be.true;
    });
});

describe('the capture action', () => {
    it('does nothing if no player is specified', () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.CAPTURE, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if a player is specified but no card(s) are specified', () => {
        const originalState = gameState.initialState();

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0 });
        expect(nextState).to.equal(originalState);

        const anotherState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [] });
        expect(anotherState).to.equal(originalState);
    });

    it('does nothing if a player and hand cards are specified but no table card(s) are specified', () => {
        const originalState = gameState.initialState();

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [1] });
        expect(nextState).to.equal(originalState);

        const anotherState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [1], tableCards: [] });
        expect(anotherState).to.equal(originalState);
    });

    it('does nothing if a player and table cards are specified but no hand card(s) are specified', () => {
        const originalState = gameState.initialState();

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, tableCards: [1] });
        expect(nextState).to.equal(originalState);

        const anotherState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [], tableCards: [1] });
        expect(anotherState).to.equal(originalState);
    });

    it(`produces an error state if you try to specify multiple cards for both player and table cards`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0, 1], tableCards: [0, 1] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot use multiple cards from hand to capture multiple cards');
    });

    it(`produces an error state if you try to use more than three hand cards to capture`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0, 1, 2, 3], tableCards: [0] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot use more than three cards to capture');
    });

    it(`produces an error state if you try to capture more than three cards`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0], tableCards: [0, 1, 2, 3] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot use more than three cards to capture');
    });

    it(`produces an error state if you try to capture a non-numeric card from the table`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            shrinkingBrew()
        ];
        originalState.table = [
            witch()
        ]

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0], tableCards: [0] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot capture non-numeric cards');
    });

    it(`produces an error state if you try to capture a non-numeric card from your hand`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            witch()
        ];
        originalState.table = [
            shrinkingBrew()
        ]

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0], tableCards: [0] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, cannot capture non-numeric cards');
    });

    it(`produces an error state if you try to use one-and-one of different values`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            shrinkingBrew()
        ];
        originalState.table = [
            bats()
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0], tableCards: [0] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, capture cards are not equal');
    });

    it(`produces an error state if the player card doesn't add up to the value of the table cards`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            shrinkingBrew()
        ];
        originalState.table = [
            bats(),
            toads()
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0], tableCards: [0, 1] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, capture cards are not equal');
    });

    it(`produces an error state if the player cards don't add up to the value of the table card`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            shrinkingBrew(),
            bats()
        ];
        originalState.table = [
            newts()
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0, 1], tableCards: [0] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Error, capture cards are not equal');
    });

    it(`takes a player, a card from their hand, and a card from the table and puts them in the capture pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            bats()
        ];
        originalState.table = [
            bats()
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0], tableCards: [0] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.table.length, 'No cards left on table').to.equal(0);
        expect(nextState.players.byId[0].hand.length, 'No cards left in hand').to.equal(0);
        expect(nextState.players.byId[0].captured.length, 'Two cards in capture pile').to.equal(2);
    });

    it(`takes a player, multiple cards from their hand, and a card from the table and puts them in the capture pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            bats(),
            bats()
        ];
        originalState.table = [
            newts()
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0, 1], tableCards: [0] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.table.length, 'No cards left on table').to.equal(0);
        expect(nextState.players.byId[0].hand.length, 'No cards left in hand').to.equal(0);
        expect(nextState.players.byId[0].captured.length, 'Three cards in capture pile').to.equal(3);
    });

    it(`takes a player, a card from their hand, and multiple cards from the table and puts them in the capture pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            frogJuice()
        ];
        originalState.table = [
            bats(),
            newts()
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [0], tableCards: [0, 1] });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.table.length, 'No cards left on table').to.equal(0);
        expect(nextState.players.byId[0].hand.length, 'No cards left in hand').to.equal(0);
        expect(nextState.players.byId[0].captured.length, 'Three cards in capture pile').to.equal(3);
    });

    it(`preserves other data when capturing`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            shrinkingBrew(),
            frogJuice()
        ];
        originalState.table = [
            witch(),
            shrinkingBrew(),
            bats(),
            toads(),
            newts(),
            mice()
        ];

        const nextState = actions.act(actions.CAPTURE, originalState, { player: 0, cards: [1], tableCards: [1, 2, 3] });

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
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.BLACK_CAT, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no target is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.BLACK_CAT, originalState, { player: 0 });

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the specified player doesn't have the Black Cat card in hand`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.BLACK_CAT, originalState, { player: 0, target: 1 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 0 does not have the Black Cat');
    });

    it(`produces an error state if the target player has no power cards in their capture pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            blackCat()
        ];

        const nextState = actions.act(actions.BLACK_CAT, originalState, { player: 0, target: 1 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 1 does not have any power cards in their capture pile');
    });

    it(`transfers a power card from the target player's capture pile to the player's pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            blackCat()
        ];
        originalState.players.byId[0].captured = [
            bats()
        ];
        originalState.players.byId[1].captured = [
            witch(),
            toads()
        ];

        const nextState = actions.act(actions.BLACK_CAT, originalState, { player: 0, target: 1 });

        const player = nextState.players.byId[0];
        const playerCapturedBlackCat = !!(player.captured.find(card => card.name === 'Black Cat'));
        const numberOfCapturedPowerCards = player.captured.filter(card => card.isPowerCard).length;
        const target = nextState.players.byId[1];
        const targetCapturedPowerCards = target.captured.filter(card => card.isPowerCard).length;

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
    it(`does nothing if no player is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.WITCH, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the player does not have a Witch card in hand`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.WITCH, originalState, { player: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 0 does not have a Witch');
    });

    it(`puts all cards from the table and the witch into the player's capture pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            witch(),
            shrinkingBrew()
        ];
        originalState.table = [
            bats(),
            toads()
        ];

        const newState = actions.act(actions.WITCH, originalState, { player: 0 });
        const player = newState.players.byId[0];
        const playerCapturedWitch = !!(player.captured.find(card => card.name === 'Witch'));

        expect(player.hand.length, 'Player has one card left in hand').to.equal(1);
        expect(player.captured.length, 'Player captured three cards').to.equal(3);
        expect(newState.table.length, 'Table is swept clean').to.equal(0);
        expect(playerCapturedWitch, 'Player captured their witch too').to.equal(true);
    });

    it(`puts all spells in progress and ingredients on those spells into the player's capture pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            witch(),
            shrinkingBrew()
        ];
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];
        originalState.players.byId[1].spells = [
            uglifyingSpell()
        ];
        originalState.players.byId[0].ingredients = [
            shrinkingBrew(),
            frogJuice()
        ];
        originalState.players.byId[1].ingredients = [
            toads(),
            newts()
        ];
        originalState.table = [
            bats(),
            prince()
        ];

        const nextState = actions.act(actions.WITCH, originalState, { player: 0 });

        const player0 = nextState.players.byId[0];
        const player1 = nextState.players.byId[1];
        const playerCapturedSpell1 = !!(player0.captured.find(card => card.name === 'Prince to Frog Spell'));
        const playerCapturedSpell2 = !!(player0.captured.find(card => card.name === 'Uglifying Spell'));
        const playerCapturedBrew = !!(player0.captured.find(card => card.name === 'Shrinking Brew'));
        const playerCapturedJuice = !!(player0.captured.find(card => card.name === 'Frog Juice'));
        const playerCapturedToads = !!(player0.captured.find(card => card.name === 'Toads'));
        const playerCapturedNewts = !!(player0.captured.find(card => card.name === 'Newts'));
        const playerCapturedBats = !!(player0.captured.find(card => card.name === 'Bats'));
        const playerCapturedPrince = !!(player0.captured.find(card => card.name === 'Prince'));

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.be.an('undefined');

        expect(nextState.table.length, 'Table is swept clean').to.equal(0);
        expect(player0.ingredients.length, `All player 0's ingredients are gone`).to.equal(0);
        expect(player1.ingredients.length, `All player 1's ingredients are gone`).to.equal(0);
        expect(player0.spells.length, `All player 0's spells are gone`).to.equal(0);
        expect(player1.spells.length, `All player 1's spells are gone`).to.equal(0);

        expect(player0.captured.length, 'Player captured nine cards').to.equal(9);

        expect(playerCapturedSpell1, `Frog to Prince spell is in player's capture pile`).to.be.true;
        expect(playerCapturedSpell2, `Uglifying spell is in player's capture pile`).to.be.true;
        expect(playerCapturedBrew, `Shrinking Brew is in player's capture pile`).to.be.true;
        expect(playerCapturedJuice, `Frog Juice is in player's capture pile`).to.be.true;
        expect(playerCapturedToads, `Toads are in player's capture pile`).to.be.true;
        expect(playerCapturedNewts, `Newts are in player's capture pile`).to.be.true;
        expect(playerCapturedBats, `Bats are in player's capture pile`).to.be.true;
        expect(playerCapturedPrince, `Prince is in player's capture pile`).to.be.true;
    });
});

describe('the witch wash action (as action on turn)', () => {
    it(`does nothing if no player is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.WITCH_WASH, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the player does not have the Witch Wash card in hand`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.WITCH_WASH, originalState, { player: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 0 does not have the Witch Wash');
    });

    it(`produces an error state if there is not a Witch card on the table`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            witchWash()
        ];
        const nextState = actions.act(actions.WITCH_WASH, originalState, { player: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('There are no Witches to Wash');
    });

    it(`puts a Witch from the table into the player's capture pile`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            witchWash(),
            shrinkingBrew()
        ];
        originalState.table = [
            bats(),
            witch(),
            toads(),
            witch()
        ];

        const newState = actions.act(actions.WITCH_WASH, originalState, { player: 0 });
        const player = newState.players.byId[0];
        const playerCapturedWitch = !!(player.captured.find(card => card.name === 'Witch'));
        const playerCapturedWitchWash = !!(player.captured.find(card => card.name === 'Witch Wash'));

        expect(player.hand.length, 'Player has one card left in hand').to.equal(1);
        expect(player.captured.length, 'Player captured two cards').to.equal(2);
        expect(playerCapturedWitch, 'Player captured a Witch').to.equal(true);
        expect(playerCapturedWitchWash, 'Player captured the Witch Wash').to.equal(true);
        expect(newState.table.length, 'Table is one card smaller').to.equal(3);
    });
});

describe('the witch-countered-by-witch-wash action', () => {
    it(`does nothing if no player is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.WITCH_COUNTERED_BY_WASH, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no target is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.WITCH_COUNTERED_BY_WASH, originalState, { player: 0 });

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the player does not have the Witch Wash card in hand`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.WITCH_COUNTERED_BY_WASH, originalState, { player: 0, target: 1 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 0 does not have the Witch Wash');
    });

    it(`produces an error state if the target does not have a Witch card in hand`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            witchWash()
        ];

        const nextState = actions.act(actions.WITCH_COUNTERED_BY_WASH, originalState, { player: 0, target: 1 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Player 1 does not have a Witch');
    });

    it(`puts all cards from the table, the witch, and the witch wash into the player's capture pile instead of the targets`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            witchWash(),
            shrinkingBrew()
        ];
        originalState.players.byId[1].hand = [
            bats(),
            witch()
        ];
        originalState.players.byId[1].spells = [
            uglifyingSpell()
        ];
        originalState.players.byId[1].ingredients = [
            toads()
        ];
        originalState.table = [
            bats(),
            toads()
        ];

        const newState = actions.act(actions.WITCH_COUNTERED_BY_WASH, originalState, { player: 0, target: 1 });
        const player = newState.players.byId[0];
        const playerCapturedWitch = !!(player.captured.find(card => card.name === 'Witch'));
        const playerCapturedWitchWash = !!(player.captured.find(card => card.name === 'Witch Wash'))
        const playerCapturedSpell = !!(player.captured.find(card => card.name === 'Uglifying Spell'))
        const playerCapturedIngredient = !!(player.captured.find(card => card.name === 'Toads'))
        const target = newState.players.byId[1];

        expect(player.hand.length, 'Player has one card left in hand').to.equal(1);
        expect(player.captured.length, 'Player captured six cards').to.equal(6);
        expect(newState.table.length, 'Table is swept clean').to.equal(0);
        expect(playerCapturedWitch, 'Player captured the witch').to.equal(true);
        expect(playerCapturedWitchWash, 'Player captured the witch wash too').to.equal(true);
        expect(playerCapturedSpell, 'Player captured the in-progress spell').to.equal(true);
        expect(playerCapturedIngredient, 'Player captured the in-progress spell ingredient').to.equal(true);
        expect(target.hand.length, 'Target has one card left in hand').to.equal(1);
        expect(target.captured.length, 'Target did not capture any cards').to.equal(0);
    });
});

describe('the play spell action', () => {
    it(`does nothing if no player is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.PLAY_SPELL, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it('does nothing if no card is specified', () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.PLAY_SPELL, originalState, { player: 0 });

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the specified card is not a spell`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            bats()
        ];
        const nextState = actions.act(actions.PLAY_SPELL, originalState, { player: 0, card: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal('Card specified (Bats) is not a spell');
    });

    it(`adds the spell to the player's "in progress" list`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].hand = [
            bats(),
            princeToFrogSpell()
        ];

        const nextState = actions.act(actions.PLAY_SPELL, originalState, { player: 0, card: 1 });

        const player = nextState.players.byId[0];
        const playerHasSpellInProgress = !!(player.spells.find(card => card.name === 'Prince to Frog Spell'));
        const spellIsNotInPlayersHand = !(player.hand.find(card => card.name === 'Prince to Frog Spell'))

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.be.an('undefined');

        expect(player.hand.length, 'Player has one card left in hand').to.equal(1);
        expect(player.spells, 'Player has one card in spells list').to.be.an('array').and.to.have.length(1);
        expect(playerHasSpellInProgress, 'The spell card is in the in progress list').to.be.true;
        expect(spellIsNotInPlayersHand, `The spell is no longer in the player's hand`).to.be.true;
    });

});

describe("taking an ingredient from the table to add to a player's spell", () => {
    it(`does nothing if no player is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_TABLE, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no card name is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_TABLE, originalState, { player: 0 });

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no spell is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_TABLE, originalState, { player: 0, cardName: 'Shrinking Brew' });

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the named card is not on the table`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_TABLE, originalState, { player: 0, cardName: 'Bats', spell: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal(`The named card (Bats) is not available to take`);
    });

    it(`produces an error state if the named card is not in the spell's list of ingredients`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];
        originalState.table = [
            bats()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_TABLE, originalState, { player: 0, cardName: 'Bats', spell: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal(`The named card (Bats) is not an ingredient of the spell`);
    });

    it(`adds the card to the players's list of ingredients`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];
        originalState.table = [
            bats(),
            prince()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_TABLE, originalState, { player: 0, cardName: 'Prince', spell: 0 });
        const player = nextState.players.byId[0];
        const ingredientIsNotOnTable = !(nextState.table.find(card => card.name === 'Prince'));
        const playerHasIngredient = !!(player.ingredients.find(card => card.name === 'Prince'));

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.be.an('undefined');
        expect(ingredientIsNotOnTable, 'Ingredient is gone from table').to.be.true;
        expect(nextState.table.length).to.equal(1);
        expect(playerHasIngredient, `Ingredient is in player's list`).to.be.true;
        expect(player.ingredients.length).to.equal(1);
    });

    it(`adds the spell and the ingredients to the players's capture pile if the spell is complete`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];
        originalState.players.byId[0].ingredients = [
            toads(),
            shrinkingBrew(),
            frogJuice()
        ];
        originalState.table = [
            bats(),
            prince()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_TABLE, originalState, { player: 0, cardName: 'Prince', spell: 0 });

        const player = nextState.players.byId[0];
        const ingredientIsNotInList = !(player.ingredients.find(card => card.name === 'Prince'));
        const playerCapturedSpell = !!(player.captured.find(card => card.name === 'Prince to Frog Spell'));
        const playerCapturedBrew = !!(player.captured.find(card => card.name === 'Shrinking Brew'));
        const playerCapturedJuice = !!(player.captured.find(card => card.name === 'Frog Juice'));
        const playerCapturedPrince = !!(player.captured.find(card => card.name === 'Prince'));

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.be.an('undefined');
        expect(ingredientIsNotInList, `Ingredient is gone from player's list`).to.be.true;
        expect(player.ingredients.length, `Left the non-applicable ingredient alone`).to.equal(1);
        expect(playerCapturedSpell, `Spell is in player's capture pile`).to.be.true;
        expect(playerCapturedBrew, `Shrinking Brew is in player's capture pile`).to.be.true;
        expect(playerCapturedJuice, `Frog Juice is in player's capture pile`).to.be.true;
        expect(playerCapturedPrince, `Prince is in player's capture pile`).to.be.true;
        expect(player.captured.length).to.equal(4);
    });
});

describe('taking a spell component from another player and adding it to a spell', () => {
    it(`does nothing if no player is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, {});

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no target player is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, { player: 0 });

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no card name is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, { player: 0, target: 1 });

        expect(nextState).to.equal(originalState);
    });

    it(`does nothing if no spell is specified`, () => {
        const originalState = gameState.initialState();
        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, { player: 0, target: 1, cardName: 'Shrinking Brew' });

        expect(nextState).to.equal(originalState);
    });

    it(`produces an error state if the target player does not have the named card`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, { player: 0, target: 1, cardName: 'Bats', spell: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal(`The player does not have the named card (Bats)`);
    });

    it(`produces an error state if the named card is not in the spell's list of ingredients`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];
        originalState.players.byId[1].hand = [
            bats()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, { player: 0, target: 1, cardName: 'Bats', spell: 0 });

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.equal(`The named card (Bats) is not an ingredient of the spell`);
    });

    it(`adds the card from the target's hand to the players's list of ingredients`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            princeToFrogSpell()
        ];
        originalState.players.byId[1].hand = [
            prince()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, { player: 0, target: 1, cardName: 'Prince', spell: 0 });
        const player = nextState.players.byId[0];
        const target = nextState.players.byId[1];
        const ingredientIsNotInTargetsHand = !(target.hand.find(card => card.name === 'Prince'));
        const playerHasIngredient = !!(player.ingredients.find(card => card.name === 'Prince'));

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.be.an('undefined');
        expect(ingredientIsNotInTargetsHand, `Ingredient is gone from target's hand`).to.be.true;
        expect(target.hand.length).to.equal(0);
        expect(playerHasIngredient, `Ingredient is in player's list`).to.be.true;
        expect(player.ingredients.length).to.equal(1);
    });

    it(`adds the spell and the ingredients to the players's capture pile if the spell is complete`, () => {
        const originalState = gameState.initialState();
        originalState.players.byId[0].spells = [
            uglifyingSpell()
        ];
        originalState.players.byId[0].ingredients = [
            toads(),
            shrinkingBrew(),
            newts()
        ];
        originalState.players.byId[1].hand = [
            prince(),
            mice()
        ];

        const nextState = actions.act(actions.TAKE_INGREDIENT_FROM_PLAYER, originalState, { player: 0, target: 1, cardName: 'Mice', spell: 0 });
        const player = nextState.players.byId[0];
        const target = nextState.players.byId[1];

        const ingredientIsNotInList = !(player.ingredients.find(card => card.name === 'Mice'));
        const playerCapturedSpell = !!(player.captured.find(card => card.name === 'Uglifying Spell'));
        const playerCapturedToads = !!(player.captured.find(card => card.name === 'Toads'));
        const playerCapturedNewts = !!(player.captured.find(card => card.name === 'Newts'));
        const playerCapturedMice = !!(player.captured.find(card => card.name === 'Mice'));
        const ingredientIsGoneFromTargetsHand = !(target.hand.find(card => card.name === 'Mice'));
        const targetStillHasPrinceInHand = !(target.hand.find(card => card.name === 'Price'));

        expect(nextState).to.not.equal(originalState);
        expect(nextState.error).to.be.an('undefined');
        expect(ingredientIsNotInList, `Ingredient is gone from player's list`).to.be.true;
        expect(player.ingredients.length, `Left the non-applicable ingredient alone`).to.equal(1);
        expect(playerCapturedSpell, `Spell is in player's capture pile`).to.be.true;
        expect(playerCapturedToads, `Ingredient Toads is in player's capture pile`).to.be.true;
        expect(playerCapturedNewts, `Ingredient Newts is in player's capture pile`).to.be.true;
        expect(playerCapturedMice, `Ingredient Mice is in player's capture pile`).to.be.true;
        expect(player.captured.length, `Player captured spell plus three ingredients`).to.equal(4);
        expect(ingredientIsGoneFromTargetsHand, `Ingredient is gone from target's hand`).to.be.true;
        expect(targetStillHasPrinceInHand, `Other card in target's hand was left alone`).to.be.true;
    });
});
