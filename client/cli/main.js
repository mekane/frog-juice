/**
 * A command-line client to the FrogJuice game, intended to be run with Node
 **/
const game = require('../../app/main.js');
const numberOfPlayers = getNumberOfPlayers();

console.log(`Beginning new game with ${numberOfPlayers} players`);







function getNumberOfPlayers() {
    const num = parseInt(process.argv[2]);
    if (isNaN(num) || typeof num !== 'number')
        return 2;
    return Math.min(Math.max(num, 2), 4);
}
