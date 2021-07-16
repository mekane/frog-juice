import {h} from "snabbdom";

export function DeckView(deck) {
    return h('div.deck', {}, `Deck (${deck.length})`)
}
