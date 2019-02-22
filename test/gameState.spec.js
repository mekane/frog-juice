const expect = require('chai').expect;
const gameState = require('../app/gameState.js');

describe('The gameState module', () => {
    it('should export an initialState function', () => {
        const game = gameState.initialState();

        expect(game.deck).to.be.an('array').and.to.have.length(59);
        expect(game.table).to.be.an('array').and.to.have.length(0);
        expect(game.players).to.be.an('object');
        expect(game.players.byId).to.be.an('object');

        const player0 = game.players.byId[0]
        expect(player0).to.be.an('object');
        expect(player0.type).to.equal('human');
        expect(player0.hand, 'Empty initial hand').to.be.an('array').and.to.have.length(0);
        expect(player0.captured, 'Empty initial capture pile').to.be.an('array').and.to.have.length(0);
        expect(player0.spells, 'No initial spells').to.be.an('array').and.to.have.length(0);
        expect(player0.ingredients, 'No initial ingredients').to.be.an('array').and.to.have.length(0);
    });

    it('should accept an optional number of players to initialize the game', () => {
        const game = gameState.initialState(4);
        const players = Object.keys(game.players.byId);

        expect(players).to.have.length(4);
    });

    it('should default to two players', () => {
        const game = gameState.initialState();
        const players = Object.keys(game.players.byId);

        expect(players).to.have.length(2);
    });

    it('should cap the number of players at 4', () => {
        const game = gameState.initialState(17);
        const players = Object.keys(game.players.byId);

        expect(players).to.have.length(4);
    });

    it(`should initialize a shuffled deck`, () => {
        const s1 = gameState.initialState();
        const s2 = gameState.initialState();

        /* note: this could theoretically fail due to random chance, but that
         * would require two shuffles of a 58-length array to be the same. I did
         * some testing with the shuffle algorithm both to prove I got it right
         * and to see how look it took to produce shuffled state that was equivalent
         * to the original. In hundreds of millions of runs I never got one.
         * The math says the odds are less than 1 in 2.4×10^18
         */
        expect(s1.deck, 'Two game states should have different starting deck arrangements').to.not.deep.equal(s2.deck);
    });

    it('should export game state constants to represent the phase of players turns', () => {
        expect(gameState.DISCARD).to.be.a('string');
        expect(gameState.DRAW).to.be.a('string');
        expect(gameState.PLAY).to.be.a('string');
        expect(gameState.SETUP).to.be.a('string');
    });
});
