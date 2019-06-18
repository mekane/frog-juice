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
    centered(msg);
    return largeHeader(msg);
}

function prompt(msg) {
    return plain('\n' + msg);
}

function error(msg) {
    return term.red.bold(msg);
}

function welcomeScreen() {
    term.clear();

    const title = 'Welcome to Frog Juice!';

    centered(title);
    mediumHeader(title);

    term.moveTo(1, term.height);
}

function card(card) {
    const valueIndicator = card.isPowerCard ? '*' : `[${card.numericValue}]`;
    return `${card.name} ${valueIndicator}`;

}

function centered(text) {
    const x = (term.width - text.length) / 2;
    return term.column(x);
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
    prompt,
    error,
    welcomeScreen,
    card
}
