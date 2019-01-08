# Frog Juice

This is an application written in JavaScript to run a game of Frog Juice. At present it is the core logic
written in a Flux-style action->state transition style with unit tests. The intention is for data to not be
mutated between states, but deep-freeze could be added to enforce this.

Future enhancements would be a "main" function to orchestrate this core into an actual game, along with a UI
(in React or something similar) to display the state of the game.


## History
I wrote a similar application in Java way back in 2001 using AWT. It was much more awkward and less elegant,
but I had a lot of time on my hands. I got it mostly complete, including AI players that could make a
lot of decisions about what to do.
