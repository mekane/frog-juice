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

    it('should export game state constants to represent the phase of players turns', () => {
        expect(gameState.DISCARD).to.be.a('string');
        expect(gameState.DRAW).to.be.a('string');
        expect(gameState.PLAY).to.be.a('string');
        expect(gameState.SETUP).to.be.a('string');
    });
});
