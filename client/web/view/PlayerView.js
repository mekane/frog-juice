import {h} from "snabbdom";
import {CardView} from "./CardView";

/**
 * @typedef Player
 * @type {object}
 * @property {string} name - card name
 * @property {string} type - "human" or "computer"
 * @property {Card[]} hand
 * @property {Card[]} captured
 * @property {Card[]} spells
 * @property {Card{}} ingredients - this is actually a more involved data structure I think
 */

/**
 * @param {Player} player
 * @returns {VNode}
 * @constructor
 */
export function PlayerView(player) {
    const title = h('header', player.name + ' Full View')
    const hand = h('div.hand.card-list', {}, player.hand.map(CardView));
    const captured = h('div.captured', {}, player.captured.length)

    return h('div.player', {}, [
        title,
        hand,
        captured
    ])
}
