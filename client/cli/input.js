const term = require('terminal-kit').terminal;

listenForControlKeysToExit();

function listenForControlKeysToExit() {
    term.on('key', function(name, matches, data) {
        if (name === 'CTRL_C') {
            term.grabInput(false);
            setTimeout(function() { process.exit() }, 100);
        }
    });
}

async function enterToContinue() {
    term('Press ENTER to continue');

    return term.inputField({ echo: false }).promise;
}

async function mainPhaseActionMenu() {
    const items = ['Capture', 'Play Spell', 'Witch', 'Black Cat', 'Witch Wash', 'Pass'];

    const choice = await term.singleLineMenu(items, {
        selectedStyle: term.dim.blue.bgGreen
    }).promise;

    return choice.selectedText;
}

module.exports = {
    enterToContinue,
    mainPhaseActionMenu
}
