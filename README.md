# Frog Juice

This is an application written in JavaScript to run a game of Frog Juice.
It consists of a few core logic modules which provide the basic game state to
a client. The client code is completely decoupled from the application core, so
various clients can all use the same app code.

The *gameState* module encodes the basic information about the cards and data
structures that make up the game. It can construct a new deck, and the data
structure to represent a game.

The *actions* module is written in a Flux-style action->state transition style
with unit tests. It takes a starting game state, an action, and some options and
returns the new game state resulting from that action. The original state is not
mutated, with deep-freeze included to enforce this.

The *main* module provides a client-friendly api to manage a game. It abstracts
away much of the state tracking and transitions via a set of methods by which
clients can express what the player wants to do in game terms. It encodes some
additional game rules, such as dealing four cards to each player and four to the
middle when starting a new game. It keeps track of the current player, the
current game "phase" (i.e. Draw / Play / Discard), can detect game-over, and can
calculate the scores.

A client basically just needs to load the main module and call newGame, then
provide prompts for the player according to the game state and available actions.

## Unit Tests

Make sure to `npm install` and then run `npm test` in the root directory. The
unit tests verify that the initial game state is set up correctly, that specific
actions have the expected effects on game state, and that the main module tracks
everything correctly.

I have not measured test coverage, but I expect it is quite high. I developed
the core modules using TDD, though I let myself take fairly large steps.

## How to Play

A command-line client is in progress, so currently the only way to "play" is to
program a game, the way the big test at the end of main.spec.js does.

## History
I wrote a similar application in Java way back in 2001 using AWT. It was much
more awkward and less elegant,but I had a lot of time on my hands. I got it
mostly complete, including AI players that could make a lot of decisions about
what to do. Looking back at that code I had everything coupled together in ways
that made it fairly easy to write and get working, but difficult to go back and
understand and change later. I tended to start with some basic class definitions
and then quickly add in the visual components (to the same classes) to think
through how the game would work. This led to a few massive methods that have to
keep track of everything, and very fat classes with many responsibilities each.

Compared to that, the new design is much more decoupled, and modules have fewer
responsibilities. I liked defining the game state, and the actions that can
affect it, in complete isolation from any UI code, or anything else really. I
also really like the way the state->action->state lends itself to thorough
testing, since each state transition is a deterministic step through a pure
function.
