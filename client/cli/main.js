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
    let error = null;
    while (game.currentPhase() !== game.OVER) {
        showState();
        error = await playerActionForPhase();

        show.newLine();

        if (error)
            show.error(`ERROR: ${error}`)

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

async function playerActionForPhase() {
    const phase = game.currentPhase();
    const player = getCurrentPlayer();

    if (phase === game.DRAW) {
        show.plain('Press ENTER to draw a card');
        game.playerDraw();
    }
    else if (phase === game.DISCARD) {
        show.plain('Choose a card from your hand to discard');
        const discardChoice = await input.chooseCardFrom(player.hand);
        game.playerDiscard(discardChoice);
    }
    else if (phase === game.PLAY) {
        /*
         * TODO: add "add card to spell in play" if applicable
         * TODO: if !canPlayAction() just show the "add cards to spell or done" menu
         */
        const actionChoice = await input.mainPhaseActionMenu();

        if (actionChoice === input.actions.CAPTURE) {
            //TODO: input card choice(s) for table and hand
            //TODO: limit further choices to unselected (or see if term-kit has a multi-choice)
        }
        else if (actionChoice === input.actions.PLAY_SPELL) {
            show.prompt('Choose a spell card to play (esc to cancel):');
            const chosenCardIndex = await input.chooseCardFrom(player.hand);
            if (wasCanceled(chosenCardIndex))
                return;

            const chosenCard = player.hand[chosenCardIndex];

            if (!chosenCard.isSpell) {
                show.error(`${chosenCard.name} is not a spell!`);
                return
            }
            return game.playerTurn(game.playerAction.PLAY_SPELL, { card: chosenCardIndex });
        }
        else if (actionChoice === input.actions.WITCH) {
            //game.playerTurn(game.playerAction.PLAY_WITCH)
        }
        else if (actionChoice === input.actions.BLACK_CAT) {
            show.prompt('Choose a player to steal from (esc to cancel):');
            const otherPlayerId = await chooseOtherPlayer();
            if (wasCanceled(otherPlayerId))
                return;

            return game.playerTurn(game.playerAction.PLAY_BLACK_CAT, { target: otherPlayerId });
        }
        else if (actionChoice === input.actions.WITCH_WASH) {
            //return game.playerTurn(game.playerAction.PLAY_WITCH_WASH)
        }
        else if (actionChoice === input.actions.PASS) {
            return game.playerTurn(game.playerAction.PASS);
        }
        else {
            show.error(`Unknown action: ${actionChoice}`);
        }
    }
    else {
        show.error(`Unknown game phase: ${phase}`);
    }

    async function chooseOtherPlayer() {
        const players = game.currentState().players.byId;
        const currentPlayerId = game.currentPlayer();
        const otherPlayerIds = Object.keys(players).filter(pid => pid != currentPlayerId);

        if (otherPlayerIds.length === 1)
            return otherPlayerIds[0];

        const playerChoices = otherPlayerIds.map(pid => players[pid].name);

        const chosenIndex = await input.chooseOneOptional(playerChoices);

        if (wasCanceled(chosenIndex))
            return;

        return otherPlayerIds[chosenIndex];
    }
}

function wasCanceled(arg) {
    return typeof arg === 'undefined';
}

function displayFinalScores() {
    const scores = game.getPlayerScores();
    const player = game.currentState().players.byId;

    show.mediumHeader(`\nGAME OVER`);
    for (let i = 0; i < scores.length; i++) {
        show.plain(`${player[i].name}: ${scores[i]}`);
    }
}
