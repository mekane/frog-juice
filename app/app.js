function getNewDeck() {
    return [
        {
            name: 'Witch',
            numericValue: null,
            isPowerCard: true
        },
        {
            name: 'Shrinking Brew',
            numericValue: 1,
            isPowerCard: false
        },
        {
            name: 'Bats',
            numericValue: 2,
            isPowerCard: false
        }
    ];
}

function newGame() {
    return {
        deck: getNewDeck(),
        table: [],
        players: {
            byId: {
                0: {
                    type: 'human',
                    hand: [],
                    captured: []
                },
                1: {
                    type: 'robot',
                    hand: [],
                    captured: []
                }
            }
        }
    };
}


module.exports = {
    newGame
};
