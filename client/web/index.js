/**
 * This gets built with webpack, hence the mixing and matching of module styles
 */
const game = require('../../app/main.js');
const action = game.playerAction;

import {GameView} from './view/GameView';

console.log('game bundle init', game)

const $setupControls = document.querySelector('#setup')
const $gameView = document.querySelector('#game')
const $numberOfPlayersField = document.querySelector('#number-of-players')
const $newGameButton = document.querySelector('#start')
const $gameControls = document.querySelector('#controls')

const view = GameView($gameView)
updateGameView()

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
    //const playerName = playerValue => playerValue + 1
    const playerName = _ => _

    if (phase === game.PLAY)
        return `Player ${playerName(player)} is playing`
    else if (phase === game.DISCARD)
        return `Player ${playerName(player)} is discarding`
    else if (phase === game.DRAW)
        return `Player ${playerName(player)} is drawing`
    else if (phase === game.OVER)
        return 'Game Over'
    else if (phase === game.SETUP)
        return 'Game is being set up'
    else
        return `Unknown phase (${phase})`
}

function updateGameView() {
    const gameState = game.currentState()
    const phaseSummary = getPhaseSummary(game.currentPhase(), game.currentPlayer())
    const states = {
        currentPhase: game.currentPhase(),
        currentPlayer: game.currentPlayer(),
        phaseSummary
    }

    const state = Object.assign(states, gameState)
    view.update(state)

    const gameInProgress = (states.currentPhase === game.PLAY);

    $gameControls.classList.toggle('hide', !gameInProgress)
}


/*DEBUG - auto start game*/
document.getElementById('start').click()
