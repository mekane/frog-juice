/**
 * This gets built with webpack, hence the mixing and matching of module styles
 */
const game = require('../../app/main.js');

console.log('game bundle init', game)

$setupControls = document.querySelector('#setup')
$gameView = document.querySelector('#game')
$numberOfPlayersField = document.querySelector('#number-of-players')
$newGameButton = document.querySelector('#start')

function getNumberOfPlayers() {
    const num = parseInt($numberOfPlayersField.value);
    if (isNaN(num) || typeof num !== 'number')
        return 2
    return Math.min(Math.max(num, 2), 4)
}

$newGameButton.addEventListener('click', e => {
    const numberOfPlayers = getNumberOfPlayers()
    game.newGame(numberOfPlayers)
    $setupControls.classList.add('hide')
    $gameView.classList.remove('hide')
    console.log('game state', game.currentState())
})
