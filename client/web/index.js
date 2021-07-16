/**
 * This gets built with webpack, hence the mixing and matching of module styles
 */
const game = require('../../app/main.js');
import {GameView} from './view/GameView';

console.log('game bundle init', game)

const $setupControls = document.querySelector('#setup')
const $gameView = document.querySelector('#game')
const $numberOfPlayersField = document.querySelector('#number-of-players')
const $newGameButton = document.querySelector('#start')

const view = GameView($gameView)

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
    updateGameView()
})

function getPhaseSummary(phase, player) {
    if (phase === game.PLAY)
        return `Player ${player + 1} is playing`
    else if (phase === game.DISCARD)
        return `Player ${player + 1} is discarding`
    else if (phase === game.DRAW)
        return `Player ${player + 1} is drawing`
    else if (phase === game.OVER)
        return 'Game Over'
    else if (phase === game.SETUP)
        return 'Game is being set up'
    else
        return `Unknown phase (${phase})`
}

function updateGameView() {
    const state = game.currentState()
    const phaseSummary = getPhaseSummary(game.currentPhase(), game.currentPlayer())

    view.update(state, phaseSummary)
}
