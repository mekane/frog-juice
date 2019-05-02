/**
 * A command-line client to the FrogJuice game, intended to be run with Node
 **/
const game = require('../../app/main.js');
const numberOfPlayers = getNumberOfPlayers();
const show = require('./formatting.js');

show.plain(`Beginning new game with ${numberOfPlayers} players\n`);

game.newGame(numberOfPlayers);

show.gameHeader('Welcome to Frog Juice!')

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
        show.smallHeader('Turn #\n');
    }

    function showOtherPlayerSummaries() {
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (currentPlayerId != id) {
                showPlayerSummaryBar(players[id]);
            }
        }
        show.newLine();
    }

    function showDeck() {
        show.plain(`There are ${state.deck.length} cards left in the deck.\n`);
    }

    function showTable() {
        show.strong('Table:')
        showTableCards(state.table);
        show.plain('\n');
    }
}


function showPlayerSummaryBar(player) {
    const name = player.name;
    const hand = player.hand.length;
    const captured = player.captured.length;
    const spellCount = player.spells.length;
    const s = spellCount === 1 ? '' : 's';
    const spells = spellCount > 0 ? `${spells} spell${s} in progress` : '';

    show.plain(`${name}: ${hand} cards in hand. ${captured} captured. ${spells}`);
}

function showTableCards(cards) {
    cards.forEach(card => show.plain(card.name));
}

function showCurrentPlayerSummary(player) {
    showCurrentPlayerHeader();
    showPlayerCapturedStats();
    showPlayerSpellsInProgress();
    showPlayerHand();

    function showCurrentPlayerHeader() {
        show.plain(`You are ${player.name}! It's your turn!\n`);
    }

    function showPlayerCapturedStats() {
        const captured = player.captured.length;
        const powerCards = player.captured.filter(card => card.isPowerCard).length;

        show.plain(`You have captured ${captured} cards (${powerCards} power cards)`);
    }

    function showPlayerSpellsInProgress() {
        if (player.spells.length) {
            show.plain(`You have ${player.spells.length} spells in progress`);
            //TODO: show details including ingredients, etc.
        }
    }

    function showPlayerHand() {
        show.strong('Your Hand:');
        player.hand.forEach(card => show.plain(card.name));
    }
}

function promptForInput(main) {
    const phase = game.currentPhase();

    if (phase === game.DRAW) {

    }
}

function displayFinalScores() {
    const scores = game.getPlayerScores();
    const player = game.currentState().players.byId;

    show.mediumHeader(`\nGAME OVER`);
    for (let i = 0; i < scores.length; i++) {
        show.plain(`${player[i].name}: ${scores[i]}`);
    }
}
