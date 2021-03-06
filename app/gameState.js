const DISCARD = 'DISCARD';
const DRAW = 'DRAW';
const OVER = 'OVER';
const PLAY = 'PLAY';
const SETUP = 'SETUP';

function getAllSpellIngredientNames() {
    const spellIngredientCards = [
        shrinkingBrew(),
        bats(),
        toads(),
        newts(),
        mice(),
        frogJuice(),
        toadStools(),
        unicornHorn(),
        monkeyPowder(),
        starAndMoonDust(),
        deadlyNightshade(),
        prince()
    ];

    const spellNames = spellIngredientCards.map(c => c.name);
    return spellNames.sort();
}

function getNewDeck() {
    return [
        shrinkingBrew(),
        shrinkingBrew(),
        shrinkingBrew(),
        shrinkingBrew(),
        bats(),
        bats(),
        bats(),
        bats(),
        toads(),
        toads(),
        toads(),
        toads(),
        newts(),
        newts(),
        newts(),
        newts(),
        mice(),
        mice(),
        mice(),
        mice(),
        frogJuice(),
        frogJuice(),
        frogJuice(),
        frogJuice(),
        toadStools(),
        toadStools(),
        toadStools(),
        toadStools(),
        unicornHorn(),
        unicornHorn(),
        unicornHorn(),
        unicornHorn(),
        monkeyPowder(),
        monkeyPowder(),
        monkeyPowder(),
        monkeyPowder(),
        starAndMoonDust(),
        starAndMoonDust(),
        starAndMoonDust(),
        starAndMoonDust(),
        deadlyNightshade(),
        deadlyNightshade(),
        deadlyNightshade(),
        deadlyNightshade(),
        prince(),
        prince(),
        princess(),
        princess(),
        witch(),
        witch(),
        witch(),
        witch(),
        witchWash(),
        blackCat(),
        antigravitySpell(),
        disappearingSpell(),
        eternalSleepSpell(),
        princeToFrogSpell(),
        uglifyingSpell()
    ];
}

function shuffle(oldDeck) {
    let deck = oldDeck.slice();
    let temp = null;

    for (let i = deck.length - 1; i > 0; i--) {
        let randomCardIndex = Math.floor(Math.random() * (i + 1));

        temp = deck[i];
        deck[i] = deck[randomCardIndex];
        deck[randomCardIndex] = temp;
    }

    return deck;
}

function initialState(numberOfPlayers) {
    const players = {
        0: getNewPlayer('Player 0'),
        1: getNewPlayer('Player 1')
    };

    if (numberOfPlayers >= 3) {
        players[2] = getNewPlayer('Player 2');
    }

    if (numberOfPlayers >= 4) {
        players[3] = getNewPlayer('Player 3');
    }

    return {
        deck: shuffle(getNewDeck()),
        table: [],
        players: {
            byId: players
        },
        currentPlayer: null,
        currentState: 'SETUP'
    };
}

function getNewPlayer(name) {
    return {
        name,
        type: 'human',
        hand: [],
        captured: [],
        spells: [],
        ingredients: []
    }
}

function antigravitySpell() {
    return {
        name: 'Anti-Gravity Spell',
        numericValue: null,
        isPowerCard: true,
        isSpell: true,
        ingredients: ['Monkey Powder', 'Star and Moon Dust']
    }
}

function bats() {
    return {
        name: 'Bats',
        numericValue: 2,
        isPowerCard: false
    }
}

function blackCat() {
    return {
        name: 'Black Cat',
        numericValue: null,
        isPowerCard: true
    }
}

function deadlyNightshade() {
    return {
        name: 'Deadly Nightshade',
        numericValue: 11,
        isPowerCard: false
    }
}

function disappearingSpell() {
    return {
        name: 'Disappearing Spell',
        numericValue: null,
        isPowerCard: true,
        isSpell: true,
        ingredients: ['Bats', 'Unicorn Horn']
    }
}

function eternalSleepSpell() {
    return {
        name: 'Eternal Sleep Spell',
        numericValue: null,
        isPowerCard: true,
        isSpell: true,
        ingredients: ['Toadstools', 'Deadly Nightshade']
    };
}

function frogJuice() {
    return {
        name: 'Frog Juice',
        numericValue: 6,
        isPowerCard: true
    }
}

function mice() {
    return {
        name: 'Mice',
        numericValue: 5,
        isPowerCard: false
    }
}

function monkeyPowder() {
    return {
        name: 'Monkey Powder',
        numericValue: 9,
        isPowerCard: false
    }
}

function newts() {
    return {
        name: 'Newts',
        numericValue: 4,
        isPowerCard: false
    }
}

function prince() {
    return {
        name: 'Prince',
        numericValue: 12,
        isPowerCard: false
    }
}

function princess() {
    return {
        name: 'Princess',
        numericValue: 12,
        isPowerCard: false
    };
}

function princeToFrogSpell() {
    return {
        name: 'Prince to Frog Spell',
        numericValue: null,
        isPowerCard: true,
        isSpell: true,
        ingredients: ['Shrinking Brew', 'Prince', 'Frog Juice']
    }
}

function shrinkingBrew() {
    return {
        name: 'Shrinking Brew',
        numericValue: 1,
        isPowerCard: false
    }
}

function starAndMoonDust() {
    return {
        name: 'Star and Moon Dust',
        numericValue: 10,
        isPowerCard: false
    }
}

function toads() {
    return {
        name: 'Toads',
        numericValue: 3,
        isPowerCard: false
    }
}

function toadStools() {
    return {
        name: 'Toadstools',
        numericValue: 7,
        isPowerCard: false
    }
}

function uglifyingSpell() {
    return {
        name: 'Uglifying Spell',
        numericValue: null,
        isPowerCard: true,
        isSpell: true,
        ingredients: ['Toads', 'Newts', 'Mice']
    }
}

function unicornHorn() {
    return {
        name: 'Unicorn Horn',
        numericValue: 8,
        isPowerCard: false
    }
}

function witch() {
    return {
        name: 'Witch',
        numericValue: null,
        isPowerCard: true
    }
}

function witchWash() {
    return {
        name: 'Witch Wash',
        numericValue: null,
        isPowerCard: true
    }
}



module.exports = {
    initialState,
    DISCARD,
    DRAW,
    OVER,
    PLAY,
    SETUP,
    antigravitySpell,
    bats,
    blackCat,
    deadlyNightshade,
    frogJuice,
    getAllSpellIngredientNames,
    mice,
    monkeyPowder,
    newts,
    prince,
    princess,
    princeToFrogSpell,
    shrinkingBrew,
    starAndMoonDust,
    toads,
    toadStools,
    uglifyingSpell,
    unicornHorn,
    witch,
    witchWash
};
