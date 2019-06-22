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
        const action = game.playerAction;
        const actionChoice = await input.mainPhaseActionMenu(game.getValidActions());

        if (actionChoice === action.CAPTURE) {
            let handCardIds = await chooseOneOrMoreCardsFrom(player.hand, 'hand');
            let tableCardIds;

            if (wasCanceled(handCardIds))
                return;
            else if (handCardIds.length === 1)
                tableCardIds = await chooseOneOrMoreCardsFrom(game.currentState().table, 'table');
            else if (handCardIds.length > 1)
                tableCardIds = await input.chooseCardFrom(game.currentState().table)

            console.log('Capture using hand cards: ', handCardIds);
            console.log('Capture using table cards: ', tableCardIds);
            return game.playerTurn(action.CAPTURE, { cards: handCardIds, tableCards: tableCardIds });
        }
        else if (actionChoice === action.PLAY_SPELL) {
            show.prompt('Choose a spell card to play (esc to cancel):');
            const chosenCardIndex = await input.chooseCardFrom(player.hand);
            if (wasCanceled(chosenCardIndex))
                return;

            const chosenCard = player.hand[chosenCardIndex];

            if (!chosenCard.isSpell) {
                show.error(`${chosenCard.name} is not a spell!`);
                return
            }
            return game.playerTurn(action.PLAY_SPELL, { card: chosenCardIndex });
        }
        else if (actionChoice === action.WITCH) {
            return game.playerTurn(action.PLAY_WITCH);
        }
        else if (actionChoice === action.BLACK_CAT) {
            const otherPlayerId = await chooseOtherPlayer();
            if (wasCanceled(otherPlayerId))
                return;

            return game.playerTurn(action.PLAY_BLACK_CAT, { target: otherPlayerId });
        }
        else if (actionChoice === action.WITCH_WASH) {
            return game.playerTurn(action.PLAY_WITCH_WASH);
        }
        else if (actionChoice === action.PASS) {
            return game.playerTurn(action.PASS);
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

        show.prompt('Choose a player to steal from (esc to cancel):');
        const chosenIndex = await input.chooseOneOptional(playerChoices);

        if (wasCanceled(chosenIndex))
            return;

        return otherPlayerIds[chosenIndex];
    }

    async function chooseOneOrMoreCardsFrom(options, name) {
        const remaining_options = options.slice();
        const chosen_cards = [];

        show.prompt(`Choose a card from ${name} (esc to cancel):`)
        let choice = await input.chooseCardFrom(remaining_options);

        if (wasCanceled(choice))
            return;
        else {
            chosen_cards.push(choice);
            remaining_options.splice(choice, 1)
        }

        show.prompt(`Choose a second card from ${name} (esc to just use first card):`)
        choice = await input.chooseCardFrom(remaining_options);

        if (wasCanceled(choice))
            return chosen_cards;
        else {
            chosen_cards.push(choice);
            remaining_options.splice(choice, 1)
        }

        show.prompt(`Choose a third card from ${name} (esc to just use cards so far):`)
        choice = await input.chooseCardFrom(remaining_options);

        if (wasCanceled(choice))
            return chosen_cards;
        else
            chosen_cards.push(choice);

        return chosen_cards;
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
