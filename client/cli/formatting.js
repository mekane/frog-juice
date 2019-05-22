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

function newLine() {
    return term('\n');
}

function plain(msg) {
    return term(msg + '\n');
}

function strong(msg) {
    return term.bold(msg + '\n');
}

function highlight(msg) {
    return term.bgYellow(msg + '\n');
}

function smallHeader(msg) {
    return term.underline(msg + '\n');
}

function mediumHeader(msg) {
    return term.bold.underline(msg + '\n');
}

function largeHeader(msg) {
    return term.green('======== ').underline(msg).green(' ========\n');
}

function gameHeader(msg) {
    return largeHeader(msg);
}

function error(msg) {
    return term.red.bold(msg);
}

async function mainPhaseActionMenu() {
    const items = ['Capture', 'Play Spell', 'Witch', 'Black Cat', 'Witch Wash', 'Pass'];

    const choice = await term.singleLineMenu(items, {
        //y: 1, // the menu will be on the top of the terminal
        //style: term.inverse,
        selectedStyle: term.dim.blue.bgGreen
    }).promise;

    return choice.selectedText;
}

module.exports = {
    newLine,
    plain,
    strong,
    highlight,
    smallHeader,
    mediumHeader,
    largeHeader,
    gameHeader,
    error,
    mainPhaseActionMenu
}
