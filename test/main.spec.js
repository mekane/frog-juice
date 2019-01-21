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

    it(``, () => {

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
