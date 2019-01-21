function getNewDeck() {
    return [{
            name: 'Shrinking Brew',
            numericValue: 1,
            isPowerCard: false
        },
        {
            name: 'Shrinking Brew',
            numericValue: 1,
            isPowerCard: false
        },
        {
            name: 'Shrinking Brew',
            numericValue: 1,
            isPowerCard: false
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
        },
        {
            name: 'Bats',
            numericValue: 2,
            isPowerCard: false
        },
        {
            name: 'Bats',
            numericValue: 2,
            isPowerCard: false
        },
        {
            name: 'Bats',
            numericValue: 2,
            isPowerCard: false
        },
        {
            name: 'Witch',
            numericValue: null,
            isPowerCard: true
        },
        {
            name: 'Witch',
            numericValue: null,
            isPowerCard: true
        },
        {
            name: 'Witch',
            numericValue: null,
            isPowerCard: true
        },
        {
            name: 'Witch',
            numericValue: null,
            isPowerCard: true
        }
    ];
}

function initialState() {
    return {
        deck: getNewDeck(),
        table: [],
        players: {
            byId: {
                0: {
                    type: 'human',
                    hand: [],
                    captured: [],
                    spells: [],
                    ingredients: []
                },
                1: {
                    type: 'robot',
                    hand: [],
                    captured: [],
                    spells: [],
                    ingredients: []
                }
            }
        }
    };
}


module.exports = {
    initialState
};
