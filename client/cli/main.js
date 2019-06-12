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
        show.smallHeader(`\nTurn ${game.getTurnNumber() + 1} (${game.currentPhase()})`);
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
    show.newLine();
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

function getCurrentPlayer() {
    return game.currentState().players.byId[game.currentPlayer()]
}

async function promptForInput(main) {
    const phase = game.currentPhase();
    const player = getCurrentPlayer();

    if (phase === game.DRAW) {
        show.plain('Press ENTER to draw a card');
        game.playerDraw();
    }
    else if (phase === game.DISCARD) {
        show.plain('Choose a card from your hand to discard');
        const discardChoice = await input.chooseCardFromHand(player.hand);
        game.playerDiscard(discardChoice);
    }
    else if (phase === game.PLAY) {
        /*
         * TODO: do we disable invalid actions?
         * Alternative is to just let them try things and show the resulting errors.
         * TODO: should write a unit test to enforce that they can't put the same
         * card ids in capture lists (i.e. can't capture an 8 with the same 4 specified twice)
         */
        const actionChoice = await input.mainPhaseActionMenu();

        if (actionChoice === input.actions.CAPTURE) {
            //TODO: input card choice(s) for table and hand
            //TODO: limit further choices to unselected (or see if term-kit has a multi-choice)
        }
        else if (actionChoice === input.actions.PLAY_SPELL) {
            //TODO: prompt for spell choice
        }
        else if (actionChoice === input.actions.WITCH) {
            //game.playerTurn(game.playerAction.PLAY_WITCH)
        }
        else if (actionChoice === input.actions.BLACK_CAT) {
            //TODO: choose a target player
            //game.playerTurn(game.playerAction.PLAY_BLACK_CAT)
        }
        else if (actionChoice === input.actions.WITCH_WASH) {
            //game.playerTurn(game.playerAction.PLAY_WITCH_WASH)
        }
        else if (actionChoice === input.actions.PASS) {
            game.playerTurn(game.playerAction.PASS);
        }
        else {
            show.highlight(`You chose ${actionChoice}`);
        }
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
