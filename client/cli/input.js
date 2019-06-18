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

async function chooseCardFrom(list) {
    const items = list.map(card => format.card(card));
    return chooseOneOptional(items);
}

async function chooseOneOptional(list) {
    return chooseOne(list, { cancelable: true });
}

async function chooseOne(arrayOfChoices, opts) {
    const options = opts || {};
    const choice = await term.singleColumnMenu(arrayOfChoices, options).promise;

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
    chooseCardFrom,
    chooseOne,
    chooseOneOptional,
    enterToContinue,
    mainPhaseActionMenu
}
