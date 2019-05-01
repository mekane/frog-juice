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
    showState();
    promptForInput();
}

function showState(main) {
    const state = game.currentState();
    const currentPlayerId = game.currentPlayer();
    const players = state.players.byId;
    const ids = Object.keys(players);

    showTurnHeader();
    showOtherPlayerSummaries();
    showDeck();
    showTable();
    showCurrentPlayerSummary(players[currentPlayerId])


    function showTurnHeader() {
        console.log('Turn #');
        console.log('');
    }

    function showOtherPlayerSummaries() {
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (currentPlayerId != id) {
                showPlayerSummaryBar(players[id]);
            }
        }
        console.log('');
    }

    function showDeck() {
        console.log(`There are ${state.deck.length} cards left in the deck.`);
        console.log('');
    }

    function showTable() {
        console.log('Table:')
        showTableCards(state.table);
        console.log('');
    }
}


function showPlayerSummaryBar(player) {
    const name = player.name;
    const hand = player.hand.length;
    const captured = player.captured.length;
    const spellCount = player.spells.length;
    const s = spellCount === 1 ? '' : 's';
    const spells = spellCount > 0 ? `${spells} spell${s} in progress` : '';

    console.log(`${name}: ${hand} cards in hand. ${captured} captured. ${spells}`);
}

function showTableCards(cards) {
    cards.forEach(card => console.log(card.name));
}

function showCurrentPlayerSummary(player) {
    console.log(`You are ${player.name}! It's your turn!`);
}

function promptForInput(main) {
    const phase = game.currentPhase();

    if (phase === game.DRAW) {

    }
}

function displayFinalScores() {
    const scores = game.getPlayerScores();
    const player = game.currentState().players.byId;

    console.log(`\nGAME OVER`);
    for (let i = 0; i < scores.length; i++) {
        console.log(`${player[i].name}: ${scores[i]}`);
    }
}
