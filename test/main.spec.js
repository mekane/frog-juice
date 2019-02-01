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
});

describe('Logic and functions for asking for ingredients', () => {
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
            expect(main.playerCanTakeIngredients()).to.equal(false);
        });

        it(`returns false during the Discard phase`, () => {
            startInPlayer0DiscardPhase();
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

        //enforces phase?
    });

    describe('Current player asking other player for ingredients', () => {
        it(`is a function`, () => {
            expect(main.askForIngredient).to.be.a('function');
        });

        it(`requires a player id and a card name`, () => {
            const actualGameState = {};
            const previousGameState = {};
            //TODO: no-op without both (use {target: 1, cardName: ''})
            expect(actualGameState).to.equal(previousGameState);
        });

        it.skip(`connects to the gameState action if valid`, () => {
            //TODO: set up a case where current player has a spell in progress,
            //other player has ingredient in hand, and do the TAKE_INGREDIENT action
        });

        it(`has no effect if the current player has already asked the target this turn`, () => {
            //TODO: no-op without both
        });
    });
});

/**
 * [P0-Draw] --DRAW-> [P0-Play] --ACTION-> [P0-Discard] --DISCARD-> Next Player
 * [P1-Draw] --DRAW-> [P1-Play] --ACTION-> [p1-Discard] --DISCARD-> Next Player
 *
 * The Draw->Play transition is automatic if they are already at four cards
 * The Play-Discard transition can include a "Pass" action (need to add)
 * The Discard->Next Draw transition can be auto if they have no cards to discard
 *
 *
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

        it.skip('Does not allow asking for spell ingredients during the Draw phase', () => {

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
            //testPlayingSpell();
            testPlayingWitch();
            testPlayingWitchWash();

            function testPlayingBlackCat() {
                main.newGame();
                const state = main.currentState();
                state.players.byId[0].hand[0] = gameState.blackCat();
                state.players.byId[1].captured.push(gameState.frogJuice());

                main.playerTurn(playerAction.PLAY_BLACK_CAT, { target: 1 });

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase(), 'Transition to discard after Black Cat').to.equal(gameState.DISCARD);
            }

            function testCapture() {
                main.newGame();
                const state = main.currentState();
                state.players.byId[0].hand[0] = gameState.toads();
                state.table[0] = gameState.shrinkingBrew();
                state.table[1] = gameState.bats();

                main.playerTurn(playerAction.CAPTURE, { cards: [0], tableCards: [0, 1] });

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase(), 'Transition to discard after Capture').to.equal(gameState.DISCARD);
            }

            function testPlayingWitch() {
                main.newGame();
                const state = main.currentState();
                state.players.byId[0].hand[0] = gameState.witch();

                main.playerTurn(playerAction.PLAY_WITCH);

                expect(main.currentPlayer()).to.equal(0);
                expect(main.currentPhase(), 'Transition to discard after playing Witch').to.equal(gameState.DISCARD);
            }

            function testPlayingWitchWash() {
                main.newGame();
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

        //asking for spell ingredients - doesn't transition
        //asking for spell ingredients isn't allowed after they've asked everyone
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

        it.skip('Does not allow asking for spell ingredients during the Discard phase', () => {

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
