/**
 * A command-line client to the FrogJuice game, intended to be run with Node
 **/
const game = require('../../app/main.js');
const numberOfPlayers = getNumberOfPlayers();

console.log(`Beginning new game with ${numberOfPlayers} players`);

game.newGame(numberOfPlayers);

gameLoop();

displayFinalScores();


function getNumberOfPlayers() {
    const num = parseInt(process.argv[2]);
    if (isNaN(num) || typeof num !== 'number')
        return 2;
    return Math.min(Math.max(num, 2), 4);
}

function gameLoop() {
    //show state
    //prompt current player for input (depending on phase)
}

function displayFinalScores() {
    const scores = game.getPlayerScores();
    const player = game.currentState().players.byId;

    console.log(`\nGAME OVER`);
    for (let i = 0; i < scores.length; i++) {
        console.log(`${player[i].name}: ${scores[i]}`);
    }
}
