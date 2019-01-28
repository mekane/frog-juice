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
        main.reset();
        expect(main.currentState()).to.deep.equal(gameState.initialState());
        expect(main.currentPlayer()).to.equal(null);
        expect(main.currentPhase()).to.equal(gameState.SETUP);
    });

    it(`uses the built-in action handler, but can take an alternate one`, () => {
        expect(main.overrideActionHandler).to.be.a('function');
    });

    it(`has a newGame() function that set up a new game`, () => {
        expect(main.newGame).to.be.a('function');

        const actionModule = require('../app/actions.js');
        const Reveal = actionModule.REVEAL;
        const Draw = actionModule.DRAW;

        const spy = actionSpy();
        main.overrideActionHandler(spy.act);

        main.newGame();

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
        main.reset();
        main.newGame();

        const newGameState = main.currentState();

        const player0 = newGameState.players.byId[0];
        const player1 = newGameState.players.byId[1];

        expect(player0.hand.length).to.equal(4);
        expect(player1.hand.length).to.equal(4);
        expect(newGameState.table.length).to.equal(4);
    });

    it(`keeps track of whose turn it is`, () => {
        main.newGame();

        expect(main.currentPlayer()).to.equal(0);
        expect(main.currentPhase()).to.equal(gameState.PLAY);
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
    /* Not starting at [P0-Draw] because it automatically transitions to Play
       because Player 0 starts with four cards
     */
    it('Transitions automatically to Player 0 Playing after setup', () => {
        main.reset();
        main.newGame();

        expect(main.currentPlayer()).to.equal(0);
        expect(main.currentPhase()).to.equal(gameState.PLAY);
    });

    it('Does not transition for invalid action types', () => {
        main.newGame();
        main.playerTurn('OBVIOUS_GARBAGE', {});

        expect(main.currentPlayer()).to.equal(0);
        expect(main.currentPhase()).to.equal(gameState.PLAY);
    });

    it.skip('Does not transition if there was a no-op due to invalid game state', () => {
        //TODO: look at actions.spec for situations where the action "Does Nothing"
    });

    it.skip('Does not transition if there was an error during the action', () => {
        //TODO: look at actions.spec for situations where the action produces an Error
    });

    it('Transitions to Player 0 Discarding after they play a card', () => {
        main.reset();

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
            expect(main.currentPhase()).to.equal(gameState.DISCARD);
        }

        function testCapture() {
            main.newGame();
            const state = main.currentState();
            //TODO: add real hand and table setup for a valid capture
            //state.players.byId[0].hand[0] = gameState.blackCat();

            main.playerTurn(playerAction.CAPTURE);

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.DISCARD);
        }

        function testPlayingWitch() {
            main.newGame();
            const state = main.currentState();
            state.players.byId[0].hand[0] = gameState.witch();

            main.playerTurn(playerAction.PLAY_WITCH);

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.DISCARD);
        }

        function testPlayingWitchWash() {
            main.newGame();
            const state = main.currentState();
            state.players.byId[0].hand[0] = gameState.witchWash();
            //TODO: need to add a witch on the table here
            main.playerTurn(playerAction.PLAY_WITCH_WASH);

            expect(main.currentPlayer()).to.equal(0);
            expect(main.currentPhase()).to.equal(gameState.DISCARD);
        }
    });

    it('Can transition from Playing to Discarding if the player Passes', () => {
        main.newGame();
        main.playerTurn(playerAction.PASS, { target: 1 });

        expect(main.currentPlayer()).to.equal(0);
        expect(main.currentPhase()).to.equal(gameState.DISCARD);
    });

    it('Transitions from Player 0 Discarding to Player 1 Drawing after player 1 discards', () => {
        main.reset();
        main.newGame();
        playFirstPlayersTurn();

        main.playerDiscard(0);

        expect(main.currentPlayer()).to.equal(1);
        expect(main.currentPhase()).to.equal(gameState.DRAW);
    });

    //TODO: test that it doesn't transition if the discarded index is invalid (no-op)

    //TODO: need a test to ensure that it doesn't increment the current player, but "wraps" back to first when hitting max
});

function actionSpy() {
    const actionHistory = [];

    return {
        act: function(actionName, state, options) {
            actionHistory.push(actionName);
            return {};
        },
        actionsPerformed: function() {
            return actionHistory;
        }
    };
}

function playFirstPlayersTurn() {
    main.reset();
    main.newGame();
    const state = main.currentState();
    state.players.byId[0].hand[0] = gameState.witch();
    main.playerTurn(playerAction.PLAY_WITCH);
}
