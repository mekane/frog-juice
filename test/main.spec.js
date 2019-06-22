const expect = require('chai').expect;
const gameState = require('../app/gameState.js');
const main = require('../app/main.js');

const playerAction = main.playerAction;

describe('the main module', () => {
    it(`exports an object that keeps track of the current game state`, () => {
        expect(main).to.be.an('object');
        expect(main.currentState).to.be.a('function');
        expect(main.currentPlayer).to.be.a('function');
        expect(main.currentPhase).to.be.a('function');
        expect(main.playerTurn).to.be.a('function');
    });

    it(`begins with an initial state`, () => {
        expect(main.currentState()).to.deep.equal(null);
        expect(main.currentPlayer()).to.equal(null);
        expect(main.currentPhase()).to.equal(gameState.SETUP);
    });

    it(`has a newGame() function that set up a new game`, () => {
        expect(main.newGame).to.be.a('function');

        const actionModule = require('../app/actions.js');
        const Reveal = actionModule.REVEAL;
        const Draw = actionModule.DRAW;

        const spy = actionSpy();

        main.newGame(2, spy.act);

        const expectedActions = [
            Draw,
            Draw,
            Draw,
            Draw,
            Draw,
            Draw,
            Draw,
            Draw,
            Reveal,
            Reveal,
            Reveal,
            Reveal
        ];

        expect(spy.actionsPerformed()).to.deep.equal(expectedActions);
    });

    it(`deals four cards to each player and puts four in the middle to set up a new game`, () => {
        main.newGame();

        const newGameState = main.currentState();

        const player0 = newGameState.players.byId[0];
        const player1 = newGameState.players.byId[1];

        expect(player0.hand.length).to.equal(4);
        expect(player1.hand.length).to.equal(4);
        expect(newGameState.table.length).to.equal(4);
    });

    it(`Sets up game state for more than two players`, () => {
        main.newGame(3);

        const newGameState = main.currentState();

        const player0 = newGameState.players.byId[0];
        const player1 = newGameState.players.byId[1];
        const player2 = newGameState.players.byId[2];

        expect(player0.hand.length).to.equal(4);
        expect(player1.hand.length).to.equal(4);
        expect(player2.hand.length).to.equal(4);
        expect(newGameState.table.length).to.equal(4);
    });

    it(`keeps track of whose turn it is`, () => {
        main.newGame();

        expect(main.currentPlayer()).to.equal(0);
        expect(main.currentPhase()).to.equal(gameState.PLAY);
    });

    it('keeps track of whether the player has taken an action this turn', () => {
        startInPlayer0PlayPhase();
        const state = main.currentState();
        const player0 = state.players.byId[0];
        player0.hand[0] = gameState.witch();

        expect(main.playerCanTakeAction(), 'True at start of turn').to.equal(true);

        main.playerTurn(playerAction.PLAY_WITCH);

        expect(main.playerCanTakeAction(), 'False after playing').to.equal(false);
    });

    it('resets the canTakeAction tracker when a new turn starts', () => {
        startInPlayer0PlayPhase();
        const state = main.currentState();
        state.players.byId[0].hand[0] = gameState.witch();
        main.playerTurn(playerAction.PLAY_WITCH);

        expect(main.playerCanTakeAction(), 'False after playing').to.equal(false);

        main.playerDiscard(0);

        expect(main.currentPlayer(), `Next player's turn`).to.equal(1);
        expect(main.playerCanTakeAction(), 'Action tracker was reset').to.equal(true);
    });

    it('converts a witch turn to a witch-countered-by-witch-wash if necessary', () => {
        startInPlayer0PlayPhase();
        const originalGameState = main.currentState();
        let player0 = originalGameState.players.byId[0];
        let player1 = originalGameState.players.byId[1];
        player0.hand[0] = gameState.witch();
        player1.hand.push(gameState.witchWash());

        main.playerTurn(main.playerAction.PLAY_WITCH, { wash: 1 });

        const newGameState = main.currentState();
        player0 = newGameState.players.byId[0];
        player1 = newGameState.players.byId[1];
        const player1CapturedWitch = !!(player1.captured.find(card => card.name === 'Witch'));
        const player1CapturedWash = !!(player1.captured.find(card => card.name === 'Witch Wash'));

        expect(player0.captured.length, 'Player 0 did not capture any cards').to.equal(0);
        expect(player1.captured.length, 'Player 1 got table cards, witch, and wash').to.equal(6);
        expect(player1CapturedWitch, 'Player 1 captured the witch').to.equal(true);
        expect(player1CapturedWash, 'Player 1 captured the witch wash').to.equal(true);
    });

    it('keeps track of how many turns have been taken', () => {
        main.newGame();
        expect(main.getTurnNumber()).to.equal(0);

        main.playerTurn(main.playerAction.PASS);
        main.playerDiscard(0);

        expect(main.getTurnNumber()).to.equal(1);

        main.playerTurn(main.playerAction.PASS);
        main.playerDiscard(0);

        expect(main.getTurnNumber()).to.equal(2);

        main.newGame();
        expect(main.getTurnNumber()).to.equal(0);
    });
});

describe(`Providing lists of available actions`, () => {
    it(`Provides a getValidActions method`, () => {
        expect(main.getValidActions).to.be.a('function');
    });

    it(`Always includes Capture and Pass if they can play an action`, () => {
        startInPlayer0PlayPhase();
        const actions = main.getValidActions();
        expect(actions).to.include(playerAction.CAPTURE);
        expect(actions).to.include(playerAction.PASS);
    });

    it(`Consists of only Capture and Pass if they have nothing else`, () => {
        startInPlayer0PlayPhase();
        const player = main.currentState().players.byId[main.currentPlayer()];
        player.hand = [];

        const actions = main.getValidActions();
        const expectedActions = [playerAction.CAPTURE, playerAction.PASS];

        expect(actions).to.deep.equal(expectedActions);
    });

    it(`Includes Black Cat if they have the Black Cat card`, () => {
        startInPlayer0PlayPhase();
        const player = main.currentState().players.byId[main.currentPlayer()];
        player.hand = [gameState.blackCat()];

        const actions = main.getValidActions();
        expect(actions).to.include(playerAction.PLAY_BLACK_CAT);
    });

    it(`Includes Play Spell if they have a spell card`, () => {
        startInPlayer0PlayPhase();
        const player = main.currentState().players.byId[main.currentPlayer()];
        player.hand = [gameState.uglifyingSpell()];

        const actions = main.getValidActions();
        expect(actions).to.include(playerAction.PLAY_SPELL);
    });

    it(`Includes Play Witch if they have a witch card`, () => {
        startInPlayer0PlayPhase();
        const player = main.currentState().players.byId[main.currentPlayer()];
        player.hand = [gameState.witch()];

        const actions = main.getValidActions();
        expect(actions).to.include(playerAction.PLAY_WITCH);
    });

    it(`Includes Play Witch Wash if they have a spell card`, () => {
        startInPlayer0PlayPhase();
        const player = main.currentState().players.byId[main.currentPlayer()];
        player.hand = [gameState.witchWash()];

        const actions = main.getValidActions();
        expect(actions).to.include(main.playerAction.PLAY_WITCH_WASH);
    });

    it(`Consists of only Done if they've played an action and don't have a spell in progress`, () => {
        startInPlayer0PlayPhase();
        const player = main.currentState().players.byId[main.currentPlayer()];
        player.hand = [];
        player.spells = [];

        const actions = main.getValidActions();
        expect(actions).to.include( /* DONE */ );
    });

    // it(`includes add ingredient if they have a spell in progress`, () => {});

    // it(`includes take ingredient if they have a spell in progress`, () => {});

    // it(`includes ask for ingredient if they have a spell in progress and can ask`, () => {});
});

describe(`Calculating player scores`, () => {
    it(`scores two points for whoever has the most total cards in their capture pile`, () => {
        startInPlayer0PlayPhase(4);
        const player = main.currentState().players.byId;
        player[0].captured = [];
        player[1].captured = [gameState.bats()];
        player[2].captured = [gameState.bats(), gameState.bats()];
        player[3].captured = [gameState.bats(), gameState.bats(), gameState.bats()];

        expect(main.getPlayerScores()).to.deep.equal([0, 0, 0, 2]);
    });

    it('scores zero for the most cards if the most cards == 0', () => {
        startInPlayer0PlayPhase(3);
        const player = main.currentState().players.byId;
        player[0].captured = [];
        player[1].captured = [];
        player[2].captured = [];

        expect(main.getPlayerScores()).to.deep.equal([0, 0, 0]);
    });

    it(`scores one point per power card in each player's capture pile`, () => {
        startInPlayer0PlayPhase(4);
        const player = main.currentState().players.byId;
        player[0].captured = [];
        player[1].captured = [gameState.frogJuice()];
        player[2].captured = [gameState.frogJuice(), gameState.frogJuice()];
        player[3].captured = [gameState.frogJuice(), gameState.witch(), gameState.blackCat(), gameState.princeToFrogSpell()];

        expect(main.getPlayerScores()).to.deep.equal([0, 1, 2, 6]);
    });

    it('scores two points for all players that tied for most cards', () => {
        startInPlayer0PlayPhase(4);
        const player = main.currentState().players.byId;
        player[0].captured = [gameState.frogJuice(), gameState.mice(), gameState.newts()];
        player[1].captured = [gameState.frogJuice()];
        player[2].captured = [gameState.frogJuice()];
        player[3].captured = [gameState.frogJuice(), gameState.bats(), gameState.toads()];

        expect(main.getPlayerScores()).to.deep.equal([3, 1, 1, 3]);
    });
})


describe('Logic and functions for adding ingredients to spells in play', () => {
    describe('Listing players than can still be asked', () => {

        it(`has a function to get the list of players that the current play may ask for ingredients`, () => {
            expect(main.listPlayersWhoHaveNotBeenAskedForIngredients).to.be.a('function');
        });

        it(`returns a list of all other players, excluding the current player`, () => {
            startInPlayer0PlayPhase(4);
            const listForPlayer0 = main.listPlayersWhoHaveNotBeenAskedForIngredients();

            expect(listForPlayer0).to.be.an('array').and.to.have.length(3);
            expect(listForPlayer0).to.not.contain('0');
        });

        it(`does not include players who have been asked this turn`, () => {
            startInPlayer0PlayPhase(4);
            main.askForIngredient({ target: 1, cardName: 'Bats' });

            const listForPlayer1 = main.listPlayersWhoHaveNotBeenAskedForIngredients();

            expect(listForPlayer1).to.deep.equal(['2', '3']);
        });

        it(`resets when transitioning to a new turn`, () => {
            startInPlayer0PlayPhase(4);
            main.askForIngredient({ target: 1, cardName: 'Bats' });
            main.playerTurn(playerAction.PASS);
            main.playerDiscard(0);

            const listForPlayer1 = main.listPlayersWhoHaveNotBeenAskedForIngredients();

            expect(listForPlayer1).to.be.an('array').and.to.have.length(3);
            expect(listForPlayer1).to.not.contain('1');
        });
    });

    describe('Deciding whether the current player can still take any ingredients', () => {
        it(`has a function to say whether the current player can ask for or take any ingredients`, () => {
            expect(main.playerCanTakeIngredients).to.be.a('function');
        });

        it(`returns false during the Draw phase`, () => {
            startInPlayer1DrawPhase();
            main.currentState().players.byId[1].spells = [gameState.uglifyingSpell()];
            expect(main.playerCanTakeIngredients()).to.equal(false);
        });

        it(`returns false during the Discard phase`, () => {
            startInPlayer0DiscardPhase();
            main.currentState().players.byId[0].spells = [gameState.uglifyingSpell()];
            expect(main.playerCanTakeIngredients()).to.equal(false);
        });

        it(`returns false if the player has no spells in play`, () => {
            startInPlayer0PlayPhase();
            expect(main.playerCanTakeIngredients()).to.equal(false);
        });

        it(`returns true if the player has a spell in progress`, () => {
            startInPlayer0PlayPhase();
            main.currentState().players.byId[0].spells.push(gameState.antigravitySpell());
            expect(main.playerCanTakeIngredients()).to.equal(true);
        });

        it(`returns true even if they have asked everyone, if there are any cards on the table`, () => {
            startInPlayer0PlayPhase();
            main.currentState().players.byId[0].spells.push(gameState.antigravitySpell());
            main.askForIngredient({ target: 1, cardName: 'Bats' });
            expect(main.playerCanTakeIngredients()).to.equal(true);
        });

        it(`returns false once they have asked everyone and there are no cards on the table`, () => {
            startInPlayer0PlayPhase();
            main.currentState().players.byId[0].spells.push(gameState.antigravitySpell());
            main.currentState().table = [];
            main.askForIngredient({ target: 1, cardName: 'Bats' });
            expect(main.playerCanTakeIngredients()).to.equal(false);
        });
    });

    describe('Current player adding ingredients from their hand', () => {
        it(`is a function`, () => {
            expect(main.playerAddIngredientFromHandToSpell).to.be.a('function');
        });

        it(`requires a card index from hand and a spell index`, () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();

            main.playerAddIngredientFromHandToSpell({});
            expect(main.currentState()).to.equal(originalGameState);

            main.playerAddIngredientFromHandToSpell({ spell: 0 });
            expect(main.currentState()).to.equal(originalGameState);

            main.playerAddIngredientFromHandToSpell({ card: 0 });
            expect(main.currentState()).to.equal(originalGameState);
        });

        it(`connects to the gameState action if valid`, () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();
            const player0 = originalGameState.players.byId[0];

            player0.spells.push(gameState.princeToFrogSpell());
            player0.hand[0] = gameState.prince();

            main.playerAddIngredientFromHandToSpell({ card: 0, spell: 0 });

            const newGameState = main.currentState();
            expect(newGameState).not.to.equal(originalGameState);
            expect(newGameState.players.byId[0].ingredients.length).to.equal(1);
            expect(newGameState.players.byId[0].hand.length).to.equal(3);
        });
    });

    describe('Current player asking other player for ingredients', () => {
        it(`is a function`, () => {
            expect(main.askForIngredient).to.be.a('function');
        });

        it(`requires a player id, a card name, and a spell id`, () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();

            main.askForIngredient({});
            expect(main.currentState()).to.equal(originalGameState);

            main.askForIngredient({ target: 1 });
            expect(main.currentState()).to.equal(originalGameState);

            main.askForIngredient({ cardName: 'Foo' });
            expect(main.currentState()).to.equal(originalGameState);
        });

        it(`connects to the gameState action if valid`, () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();
            const player0 = originalGameState.players.byId[0];
            const player1 = originalGameState.players.byId[1];

            player0.spells.push(gameState.princeToFrogSpell());
            player1.hand[0] = gameState.prince();

            main.askForIngredient({ target: 1, cardName: 'Prince', spell: 0 });

            const newGameState = main.currentState();
            expect(newGameState).not.to.equal(originalGameState);
            expect(newGameState.players.byId[1].hand.length).to.equal(3);
        });

        it(`has no effect if the current player has already asked the target this turn`, () => {
            startInPlayer0PlayPhase();
            let originalGameState = main.currentState();
            let player0 = originalGameState.players.byId[0];
            let player1 = originalGameState.players.byId[1];
            player1.hand = [gameState.bats()];
            player0.spells.push(gameState.princeToFrogSpell());

            main.askForIngredient({ target: 1, cardName: 'Prince', spell: 0 });

            originalGameState = main.currentState();
            player1 = originalGameState.players.byId[1];
            player1.hand = [gameState.prince()];

            main.askForIngredient({ target: 1, cardName: 'Prince', spell: 0 });
            const newGameState = main.currentState();
            expect(newGameState).to.equal(originalGameState);
            expect(newGameState.players.byId[1].hand.length).to.equal(1);
        });
    });

    describe('Current player taking an ingredient from the table', () => {
        it(`is a function`, () => {
            expect(main.takeIngredientFromTable).to.be.a('function');
        });

        it(`requires a card name and a spell id`, () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();

            main.takeIngredientFromTable({});
            expect(main.currentState()).to.equal(originalGameState);

            main.askForIngredient({ spell: 0 });
            expect(main.currentState()).to.equal(originalGameState);

            main.askForIngredient({ cardName: 'Foo' });
            expect(main.currentState()).to.equal(originalGameState);
        });

        it(`connects to the gameState action if valid`, () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();
            const player0 = originalGameState.players.byId[0];

            player0.spells.push(gameState.princeToFrogSpell());
            originalGameState.table.push(gameState.prince());

            main.takeIngredientFromTable({ cardName: 'Prince', spell: 0 });

            const newGameState = main.currentState();
            expect(newGameState).not.to.equal(originalGameState);
            expect(newGameState.players.byId[0].ingredients.length).to.equal(1);
            expect(newGameState.table.length).to.equal(4);
        });
    });
});

/**
 * SETUP
 * [P0-Draw] --DRAW-> [P0-Play] --ACTION-> [P0-Discard] --DISCARD-> Next Player
 * [P1-Draw] --DRAW-> [P1-Play] --ACTION-> [p1-Discard] --DISCARD-> Next Player
 * OVER
 *
 * SETUP is a temporary state while the initial setup is done. Not a regular state.
 * The Draw->Play transition is automatic if they are already at four cards
 * The Play->Discard transition can include a "Pass" action
 * The Discard->Next Draw transition can be auto if they have no cards to discard
 * OVER is when the game is over, as detected by the main module.
 *
 * Note that Play->Discard is delayed if the player has a spell in progress.
 * This gives them the opportunity to ask for and add ingredients. It means
 * that main has to know whether they've already done an action this turn and
 * prevent a second one (e.g. another capture) and it needs to provide a way
 * for them to indicate they are done asking for ingredients, which will then
 * transition them out of PLAY into DISCARD.
 *
 */
describe('The Game State finite state machine', () => {
    describe('the DRAW phase', () => {
        it('Does not allow playing cards in the Draw phase', () => {
            startInPlayer1DrawPhase();
            const originalGameState = main.currentState();
            let player1 = originalGameState.players.byId[1];
            player1.hand[0] = gameState.witch();

            main.playerTurn(main.playerAction.PLAY_WITCH);

            expect(main.currentPlayer()).to.equal(1);
            expect(main.currentPhase()).to.equal(gameState.DRAW);
            expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
        });

        it('Does not allow discarding cards in the Draw phase', () => {
            startInPlayer1DrawPhase();
            const originalGameState = main.currentState();

            main.playerDiscard(0);

            expect(main.currentPlayer()).to.equal(1);
            expect(main.currentPhase()).to.equal(gameState.DRAW);
            expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
        });

        it('Ignores ask and add ingredient actions in the Draw phase', () => {
            startInPlayer1DrawPhase();
            const originalGameState = main.currentState();
            const player0 = originalGameState.players.byId[0];
            const player1 = originalGameState.players.byId[1];
            player0.hand[0] = gameState.prince();
            player1.hand[1] = gameState.shrinkingBrew();
            player1.spells = [gameState.princeToFrogSpell()];
            originalGameState.table[0] = gameState.frogJuice();

            main.playerAddIngredientFromHandToSpell({ spell: 0, card: 0 });
            assertStateIsUnchanged();

            main.askForIngredient({ target: 0, cardName: 'Prince', spell: 0 });
            assertStateIsUnchanged();

            //TODO: include "done asking" action
            //assertStateIsUnchanged();

            function assertStateIsUnchanged() {
                expect(main.currentPlayer()).to.equal(1);
                expect(main.currentPhase()).to.equal(gameState.DRAW);
                expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
            }
        });

        it(`Adds a card to the player's hand and stays in the phase if they have less than four cards`, () => {
            startInPlayer1DrawPhase();
            let player1 = main.currentState().players.byId[1];
            player1.hand.pop();
            expect(player1.hand.length).to.equal(2);

            main.playerDraw();

            player1 = main.currentState().players.byId[1];

            expect(player1.hand.length).to.equal(3);
            expect(main.currentPlayer()).to.equal(1);
            expect(main.currentPhase()).to.equal(gameState.DRAW);
        });

        it(`Transitions to the Play phase once the player draws their fourth card`, () => {
            startInPlayer1DrawPhase();

            main.playerDraw();

            const player1 = main.currentState().players.byId[1];

            expect(player1.hand.length).to.equal(4);
            expect(main.currentPlayer()).to.equal(1);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
        });

        it(`Transitions to Play if the player doesn't have four cards but they drew the last card`, () => {
            main.newGame(4);
            const state = main.currentState();
            const player = state.players.byId;
            player[1].hand = [gameState.bats()];
            state.deck = [
                gameState.toadStools(),
                gameState.witch()
            ];

            main.playerTurn(playerAction.PASS);
            main.playerDiscard(0);

            expect(main.currentPlayer(), `Start second player's turn - they need to draw three cards`).to.equal(1);
            expect(main.currentPhase()).to.equal(gameState.DRAW);

            main.playerDraw();
            main.playerDraw();
            main.playerDraw();

            expect(main.currentState().players.byId[1].hand.length, 'They could only draw up to three cards').to.equal(3);
            expect(main.currentPhase(), 'Transitioned to PLAY despite fewer than four cards in hand').to.equal(gameState.PLAY);
        });
    });

    describe('the PLAY phase', () => {
        it('Does not allow drawing cards in the Play phase', () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();

            main.playerDraw();

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
            expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
        });

        it('Does not allow discarding cards in the Play phase', () => {
            startInPlayer0PlayPhase();
            const originalGameState = main.currentState();

            main.playerDiscard(0);

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
            expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
        });

        it('Transitions automatically to Player 0 Playing after setup because they start with four cards', () => {
            main.newGame();

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
        });

        it('Transitions to Player 0 Discarding after they play a card', () => {
            testPlayingBlackCat();
            testCapture();
            testPlayingWitch();
            testPlayingWitchWash();

            function testPlayingBlackCat() {
                startInPlayer0PlayPhase();
                const state = main.currentState();
                state.players.byId[0].hand[0] = gameState.blackCat();
                state.players.byId[1].captured.push(gameState.frogJuice());

                main.playerTurn(playerAction.PLAY_BLACK_CAT, { target: 1 });

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase(), 'Transition to discard after Black Cat').to.equal(gameState.DISCARD);
            }

            function testCapture() {
                startInPlayer0PlayPhase();
                const state = main.currentState();
                state.players.byId[0].hand[0] = gameState.toads();
                state.table[0] = gameState.shrinkingBrew();
                state.table[1] = gameState.bats();

                main.playerTurn(playerAction.CAPTURE, { cards: [0], tableCards: [0, 1] });

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase(), 'Transition to discard after Capture').to.equal(gameState.DISCARD);
            }

            function testPlayingWitch() {
                startInPlayer0PlayPhase();
                const state = main.currentState();
                state.players.byId[0].hand[0] = gameState.witch();

                main.playerTurn(playerAction.PLAY_WITCH);

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase(), 'Transition to discard after playing Witch').to.equal(gameState.DISCARD);
            }

            function testPlayingWitchWash() {
                startInPlayer0PlayPhase();
                const state = main.currentState();
                state.players.byId[0].hand[0] = gameState.witchWash();
                state.table[0] = gameState.witch();
                main.playerTurn(playerAction.PLAY_WITCH_WASH);

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase(), 'Transition to discard after playing Witch Wash').to.equal(gameState.DISCARD);
            }
        });

        it('Transitions from Playing to Discarding if the player Passes', () => {
            main.newGame();
            main.playerTurn(playerAction.PASS);

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.DISCARD);
        });

        it('Does not automatically transition to discarding if spell is in progress', () => {
            testPlayingSpellThisTurn();
            testRegularActionWithSpellAlreadyInPlay();

            function testPlayingSpellThisTurn() {
                startInPlayer0PlayPhase();
                const state = main.currentState();
                const player = state.players.byId[0];
                player.hand = [gameState.princeToFrogSpell()];

                main.playerTurn(playerAction.PLAY_SPELL, { card: [0] });

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase()).to.equal(gameState.PLAY);
            }

            function testRegularActionWithSpellAlreadyInPlay() {
                startInPlayer0PlayPhase();
                const state = main.currentState();
                const player0 = state.players.byId[0];
                player0.hand[0] = gameState.toads();
                player0.spells = [gameState.princeToFrogSpell()];
                state.table[0] = gameState.shrinkingBrew();
                state.table[1] = gameState.bats();

                main.playerTurn(playerAction.CAPTURE, { cards: [0], tableCards: [0, 1] });

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase()).to.equal(gameState.PLAY);
            }
        });

        it('Does not allow a second action during the same turn', () => {
            startInPlayer0PlayPhaseWithSpellAfterPlayingOneAction();
            const stateAfterOneAction = main.currentState();

            main.playerTurn(playerAction.PLAY_WITCH);
            const stateAfterSecondAction = main.currentState();

            expect(stateAfterSecondAction, 'Second action has no effect').to.equal(stateAfterOneAction);
            expect(main.currentPhase(), 'No transition').to.equal(gameState.PLAY);
        });

        it('Transitions to Discarding when the player is done with ingredients', () => {
            startInPlayer0PlayPhaseWithSpellAfterPlayingOneAction();

            main.playerDone();

            expect(main.currentPhase()).to.equal(gameState.DISCARD);
        });

        it('Does not transition for invalid action types', () => {
            main.newGame();
            main.playerTurn('OBVIOUS_GARBAGE', {});

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
        });

        it('Does not transition if there was a no-op due to invalid game state', () => {
            main.newGame();
            const gameStatePre = main.currentState();

            main.playerTurn(playerAction.CAPTURE, { options: 'bad' });
            const gameStatePost = main.currentState();

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
            expect(gameStatePre).to.equal(gameStatePost);
        });

        it('Does not transition if there was an error during the action', () => {
            main.newGame();
            const gameStatePre = main.currentState();
            gameStatePre.players.byId[0].hand = [];

            main.playerTurn(playerAction.PLAY_WITCH_WASH, {});
            const gameStatePost = main.currentState();

            expect(gameStatePre).to.equal(gameStatePost);
            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
        });
    });

    describe('the DISCARD phase', () => {
        it('Does not allow drawing during the Discard phase', () => {
            startInPlayer0DiscardPhase();
            const originalGameState = main.currentState();

            main.playerDraw();

            expect(main.currentPhase(), 'Ignores drawing during the Discard phase').to.equal(gameState.DISCARD);
            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
        });

        it('Does not allow playing cards during the Discard phase', () => {
            startInPlayer0DiscardPhase();
            const originalGameState = main.currentState();
            originalGameState.players.byId[0].hand[0] = gameState.witch();

            main.playerTurn(playerAction.PLAY_WITCH);

            expect(main.currentPhase(), 'Ignores player actions during the Discard phase').to.equal(gameState.DISCARD);
            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
        });

        it('ignores ask and add ingredient actions in the Draw phase', () => {
            startInPlayer1DiscardPhase();
            const originalGameState = main.currentState();
            const player0 = originalGameState.players.byId[0];
            const player1 = originalGameState.players.byId[1];
            player0.hand[0] = gameState.prince();
            player1.hand[0] = gameState.shrinkingBrew();
            player1.spells = [gameState.princeToFrogSpell()];
            originalGameState.table[0] = gameState.frogJuice();

            main.playerAddIngredientFromHandToSpell({ spell: 0, card: 0 });
            assertStateIsUnchanged();

            main.askForIngredient({ target: 0, cardName: 'Prince', spell: 0 });
            assertStateIsUnchanged();

            //TODO: include "done asking" action
            //assertStateIsUnchanged();

            function assertStateIsUnchanged() {
                expect(main.currentPlayer()).to.equal(1);
                expect(main.currentPhase()).to.equal(gameState.DISCARD);
                expect(main.currentState(), 'Has no effect on game state').to.equal(originalGameState);
            }
        });

        it('Transitions from Player 0 Discarding to Player 1 Drawing after player 0 discards', () => {
            startInPlayer0DiscardPhase();
            //get rid of a card from player 1's hand so they will need to draw
            main.currentState().players.byId[1].hand.pop();

            main.playerDiscard(0);

            expect(main.currentPlayer()).to.equal(1);
            expect(main.currentPhase()).to.equal(gameState.DRAW);
        });

        it('Connects the discard player action to game state change', () => {
            startInPlayer0DiscardPhase();
            main.playerDiscard(0);
            const gameState = main.currentState();

            expect(gameState.players.byId[0].hand.length).to.equal(2);
            expect(gameState.table.length).to.equal(4);
        });

        it('Does not transition if the discard is invalid', () => {
            startInPlayer0DiscardPhase();

            const gameStatePre = main.currentState();
            main.playerDiscard(-1);
            const gameStatePost = main.currentState();

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.DISCARD);
            expect(gameStatePre).to.equal(gameStatePost);
        });

        it('Transitions automatically to Player 1 playing if Player 1 already had four cards', () => {
            startInPlayer0DiscardPhase();
            main.playerDiscard(0);

            expect(main.currentPlayer()).to.equal(1);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
        });

        it('Loops back to Player 0 when the last player discards', () => {
            startInPlayer1DiscardPhase();

            main.playerDiscard(0);

            expect(main.currentPlayer()).to.equal(0);
        });
    });

    describe('detecting the end of game state', () => {
        it(`Transitions to OVER when the deck is empty, all but one players have no cards in hand, and the last player discards`, () => {
            startInPlayer1DiscardPhaseOnLastTurnOfGame();

            main.playerDiscard(0);

            expect(main.currentPlayer()).to.equal(null);
            expect(main.currentPhase()).to.equal(gameState.OVER);
        });

        it('ignores actions while in the OVER state', () => {
            startInGameOverState();

            const originalGameState = main.currentState();
            originalGameState.players.byId[0].hand = [gameState.frogJuice()];
            originalGameState.players.byId[1].hand = [gameState.witch()];
            originalGameState.players.byId[1].spells = [gameState.princeToFrogSpell()];
            originalGameState.table = [gameState.prince()]

            main.playerDraw();
            main.askForIngredient({ target: 0, cardName: 'Frog Juice', spell: 0 });
            main.takeIngredientFromTable({ cardName: 'Frog Juice', spell: 0 })
            main.playerTurn(playerAction.PLAY_WITCH);
            main.playerDiscard(0);

            expect(main.currentState(), 'Ignores player actions once game is over').to.equal(originalGameState);
        });
    });
});

describe('Integrating a realistic series of turns', () => {
    const {
        shrinkingBrew,
        bats,
        toads,
        newts,
        mice,
        frogJuice,
        toadStools,
        unicornHorn,
        monkeyPowder,
        starAndMoonDust,
        deadlyNightshade,
        princess,
        prince,
        blackCat,
        witchWash,
        witch,
        princeToFrogSpell
    } = gameState;

    it('correctly tracks game state through successive player turns', () => {
        //setup a curated initial game state so we can predict and test the outcome
        main.newGame(4);
        const state = main.currentState();
        const player = state.players.byId;
        player[0].hand = [shrinkingBrew(), frogJuice(), princeToFrogSpell(), bats()];
        player[1].hand = [bats(), toads(), mice()];
        player[2].hand = [witch(), newts(), monkeyPowder()];
        player[3].hand = [blackCat(), witchWash(), princess()]
        state.table = [unicornHorn(), starAndMoonDust(), deadlyNightshade(), prince()];
        state.deck = [
            toadStools(),
            witch(),
            frogJuice(),
            toads()
        ];

        /* ========== PLAYER 0 ========== */
        expect(main.currentPlayer(), `Start First Player's Turn`).to.equal(0);
        expect(main.currentPhase()).to.equal(gameState.PLAY);

        main.playerTurn(playerAction.PLAY_SPELL, { card: 2 });
        main.takeIngredientFromTable({ cardName: 'Prince', spell: 0 });
        main.playerAddIngredientFromHandToSpell({ card: 1, spell: 0 });
        main.playerAddIngredientFromHandToSpell({ card: 0, spell: 0 });

        expect(main.currentState().players.byId[0].hand.length, 'Player played three cards').to.equal(1);
        expect(main.currentState().players.byId[0].captured.length, 'Player finished spell').to.equal(4);

        /* TODO: this done() shouldn't be strictly necessary. If they have an
         * in-progress spell and then add an ingredient that finishes the spell
         * it would make sense to check if they still have any in progress and
         * automatically transition them.
         */
        main.playerDone();
        main.playerDiscard(0);

        /* ========== PLAYER 1 ========== */
        expect(main.currentPlayer(), `Start Second Player's Turn`).to.equal(1);
        expect(main.currentPhase()).to.equal(gameState.DRAW);

        main.playerDraw();

        expect(main.currentPhase()).to.equal(gameState.PLAY);

        main.playerTurn(playerAction.CAPTURE, { cards: [0, 1, 2], tableCards: [1] })

        expect(main.currentState().players.byId[1].hand.length, 'Player played three cards').to.equal(1);
        expect(main.currentState().players.byId[1].captured.length, 'Player captured four cards').to.equal(4);

        main.playerDiscard(0);

        /* ========== PLAYER 2 ========== */
        expect(main.currentPlayer(), `Start Third Player's Turn`).to.equal(2);
        expect(main.currentPhase()).to.equal(gameState.DRAW);

        main.playerDraw();

        main.playerTurn(playerAction.PLAY_WITCH, { wash: 3 });
        expect(main.currentState().players.byId[3].captured.length, 'Player 3 washed the witch').to.equal(6);

        main.playerDiscard(0);

        /* ========== PLAYER 3 ========== */
        expect(main.currentPlayer(), `Start Third Player's Turn`).to.equal(3);
        expect(main.currentPhase()).to.equal(gameState.DRAW);

        main.playerDraw();
        main.playerDraw();

        main.playerTurn(playerAction.PLAY_BLACK_CAT, { target: 0 });
        expect(main.currentState().players.byId[3].captured.length, 'Player 3 got black cat and another card').to.equal(8);

        expect(main.getPlayerScores()).to.deep.equal([1, 0, 0, 6]);
    });
});

function actionSpy() {
    const actionHistory = [];

    return {
        act: function(actionName, state, options) {
            actionHistory.push(actionName);
            return state;
        },
        actionsPerformed: function() {
            return actionHistory;
        }
    };
}

function startInPlayer0PlayPhase(num) {
    main.newGame(num);
}

function startInPlayer0PlayPhaseWithSpellAfterPlayingOneAction() {
    startInPlayer0PlayPhase();
    const originalGameState = main.currentState();
    const player0 = originalGameState.players.byId[0];
    player0.hand[0] = gameState.mice();
    player0.hand[1] = gameState.witch();
    player0.spells = [gameState.uglifyingSpell()];
    originalGameState.table = [gameState.bats(), gameState.toads()];

    main.playerTurn(playerAction.CAPTURE, { cards: [0], tableCards: [0, 1] });
}

function startInPlayer0DiscardPhase(num) {
    startInPlayer0PlayPhase(num);

    const state = main.currentState();
    state.players.byId[0].hand[0] = gameState.shrinkingBrew();
    state.table[0] = gameState.shrinkingBrew();

    main.playerTurn(playerAction.CAPTURE, { cards: [0], tableCards: [0] });
}

function startInPlayer1DrawPhase(num) {
    startInPlayer0DiscardPhase(num);

    //get rid of a card from player 1's hand so they will need to draw
    main.currentState().players.byId[1].hand.pop();

    main.playerDiscard(0);
}

function startInPlayer1PlayPhase(num) {
    startInPlayer1DrawPhase(num);

    main.playerDraw();
}

function startInPlayer1DiscardPhase() {
    startInPlayer1PlayPhase();

    const state = main.currentState();
    state.players.byId[1].hand[0] = gameState.shrinkingBrew();
    state.table[0] = gameState.shrinkingBrew();

    main.playerTurn(playerAction.CAPTURE, { cards: [0], tableCards: [0] });
}

function startInPlayer1DiscardPhaseOnLastTurnOfGame() {
    startInPlayer1DiscardPhase();

    const state = main.currentState();
    state.players.byId[0].hand = [];
    state.players.byId[1].hand = [gameState.bats()];
    state.deck = [];
}

function startInGameOverState() {
    startInPlayer1DiscardPhaseOnLastTurnOfGame();
    main.playerDiscard(0);
}
