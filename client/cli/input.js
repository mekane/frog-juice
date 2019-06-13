const term = require('terminal-kit').terminal;
const format = require('./formatting.js');

listenForControlKeysToExit();

const actions = {
    CAPTURE: 'Capture',
    PLAY_SPELL: 'Play Spell',
    WITCH: 'Witch',
    BLACK_CAT: 'Black Cat',
    WITCH_WASH: 'Witch Wash',
    PASS: 'Pass'
}

function listenForControlKeysToExit() {
    term.on('key', function(name, matches, data) {
        if (name === 'CTRL_C') {
            term.grabInput(false);
            setTimeout(function() { process.exit() }, 100);
        }
    });
}

async function chooseCardFromHand(hand) {
    const items = hand.map(card => format.card(card));
    return chooseOne(items);
}

async function chooseOne(arrayOfChoices) {
    const choice = await term.singleColumnMenu(arrayOfChoices).promise;

    return choice.selectedIndex;
}

async function enterToContinue() {
    term('Press ENTER to continue');

    return term.inputField({ echo: false }).promise;
}

async function mainPhaseActionMenu() {
    const items = Object.values(actions);

    const choice = await term.singleLineMenu(items, {
        selectedStyle: term.dim.blue.bgGreen
    }).promise;

    return choice.selectedText;
}

module.exports = {
    actions,
    chooseCardFromHand,
    chooseOne,
    enterToContinue,
    mainPhaseActionMenu
}
