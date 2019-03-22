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

    //can calculate player scores (not just when game is over)
});

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

    describe('Currnet player adding ingredients from their hand', () => {
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
 * The Play->Discard transition can include a "Pass" action (need to add)
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

        it.skip('Does not allow a second action during the same turn', () => {

        });

        it.skip('Transitions to Discarding when the player is done with ingredients', () => {

        })

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

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.PLAY);
            expect(gameStatePre).to.equal(gameStatePost);
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

        //TODO: add ask for ingredient and "done asking" action
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
    it.skip('correctly tracks game state through successive player turns')
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
