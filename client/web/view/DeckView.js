import {h} from "snabbdom";

export function DeckView(deck) {
    return h('div.deck.zone', {}, `Deck (${deck.length})`)
}
