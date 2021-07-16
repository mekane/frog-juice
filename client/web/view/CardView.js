import {h} from "snabbdom";

export function CardView(card) {
    return h('div.card', {}, card.name)
}
