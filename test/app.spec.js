const expect = require('chai').expect;
const app = require('../app/app.js');

describe('The app module', () => {
    it('should export a newGame module', () => {
        const game = app.newGame();

        expect(game.deck).to.be.an('array').and.to.have.length(3);
        expect(game.table).to.be.an('array').and.to.have.length(0);
        expect(game.players).to.be.an('object');
        expect(game.players.byId).to.be.an('object');
        expect(game.players.byId['0']).to.be.an('object');
    });
});
