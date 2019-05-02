const term = require('terminal-kit').terminal;


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

module.exports = {
    newLine,
    plain,
    strong,
    highlight,
    smallHeader,
    mediumHeader,
    largeHeader,
    gameHeader
}
