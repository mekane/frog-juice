/**
 * A command-line client to the FrogJuice game, intended to be run with Node
 **/
const game = require('../../app/main.js');
const input = require('./input.js');
const show = require('./formatting.js');

game.newGame(getNumberOfPlayers());

main();


async function main() {
    await showWelcomeScreen();

    await gameLoop();

    displayFinalScores();

    process.exit(0);
}

function getNumberOfPlayers() {
    const num = parseInt(process.argv[2]);
    if (isNaN(num) || typeof num !== 'number')
        return 2;
    return Math.min(Math.max(num, 2), 4);
}

async function gameLoop() {
    let action = null;
    while (game.currentPhase() !== game.OVER && action !== 'Pass') {
        showState();
        action = await promptForInput();
        show.newLine();
        show.plain(`You chose ${action}`);

        show.newLine();
        show.newLine();
        show.newLine();
        show.newLine();
        show.newLine();
        show.newLine();
    }
}

async function showWelcomeScreen() {
    show.welcomeScreen();
    return input.enterToContinue();
}

function showState(main) {
    const state = game.currentState();
    const currentPlayerId = game.currentPlayer();
    const players = state.players.byId;
    const ids = Object.keys(players);

    showTurnHeader();
    showPlayerSummaries();
    showDeck();
    showTable();
    showCurrentPlayerStatus(players[currentPlayerId])


    function showTurnHeader() {
        show.smallHeader(`\nTurn ${game.getTurnNumber() + 1}`);
    }

    function showPlayerSummaries() {
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (currentPlayerId != id) {
                showPlayerSummaryBar(players[id]);
            }
            else {
                showCurrentPlayerSummaryBar(players[id])
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

function showCurrentPlayerSummaryBar(player) {
    const hand = player.hand.length;
    const captured = player.captured.length;
    const powerCards = player.captured.filter(card => card.isPowerCard).length;

    show.plain(`You: ${hand} cards in hand. ${captured} captured. (${powerCards} power cards)`);
}


function showTableCards(cards) {
    cards.forEach(card => show.plain(show.card(card)));
    show.plain('');
}

function showCurrentPlayerStatus(player) {
    showPlayerSpellsInProgress();
    showPlayerHand();

    function showPlayerSpellsInProgress() {
        if (player.spells.length) {
            show.plain(`You have ${player.spells.length} spells in progress`);
            //TODO: show details including ingredients, etc.
        }
    }

    function showPlayerHand() {
        show.strong('Your Hand:');
        player.hand.forEach((card, i) => show.plain(`${i}) ${show.card(card)}`));
    }
}

async function promptForInput(main) {
    const phase = game.currentPhase();

    if (phase === game.DRAW) {
        show.plain('Press ENTER to draw a card');
        //TODO
    }
    else if (phase === game.DISCARD) {
        show.plain('Choose a card from your hand to discard');
        //TODO
    }
    else if (phase === game.PLAY) {
        return input.mainPhaseActionMenu();
    }
    else {
        show.error(`Unknown game phase: ` + phase);
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
