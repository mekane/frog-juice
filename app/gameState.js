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
        powerCard: true
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
        powerCard: true
    }
}

function witchWash() {
    return {
        name: 'Witch Wash',
        numericValue: null,
        powerCard: true
    }
}



module.exports = {
    initialState,
    antigravitySpell,
    bats,
    blackCat,
    deadlyNightshade,
    frogJuice,
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
