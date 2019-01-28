const expect = require('chai').expect;
const action = require('../app/actions.js');
const gameState = require('../app/gameState.js');
const main = require('../app/main.js');

const Reveal = action.REVEAL;
const Draw = action.DRAW;

describe('the main module', () => {
    it(`exports an object that keeps track of the current game state`, () => {
        expect(main).to.be.an('object');
        expect(main.currentState).to.be.a('function');
    });

    it(`begins with an initial state`, () => {
        expect(main.currentState()).to.deep.equal(gameState.initialState());
    });

    it(`uses the built-in action handler, but can take an alternate one`, () => {
        expect(main.overrideActionHandler).to.be.a('function');
    });

    it(`has a newGame() function that set up a new game`, () => {
        expect(main.newGame).to.be.a('function');

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
        main.overrideActionHandler(action.act);
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
        const newGameState = main.currentState();
        expect(newGameState.currentPlayer).to.be.a('number');
        expect(newGameState.currentState).to.be.a('string');
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
    it('Should start at Player 0 Playing', () => {
        main.newGame();
        const game = main.currentState();
        expect(game.currentPlayer).to.equal(0);
        expect(game.currentState).to.equal(gameState.PLAY);
    });

    it('Transitions to Player 0 Discarding after an action', () => {
        const originalState = main.newGame();
        //const nextState = action.act(action.PASS);

        //TODO: add a PASS action
        //TODO: write a test that sets up a realistic situation to play (e.g. Black Cat)
    });
});

function actionSpy() {
    const actionHistory = [];

    return {
        act: function(actionName, state, options) {
            actionHistory.push(actionName);
        },
        actionsPerformed: function() {
            return actionHistory;
        }
    };
}
