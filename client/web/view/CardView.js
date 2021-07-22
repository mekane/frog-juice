import {h} from "snabbdom";

/**
 * @typedef Card
 * @type {object}
 * @property {number} numericValue - if the card is an ingredient, what is its number
 * @property {string} name - card name
 * @property {boolean} isPowerCard - whether the card is worth bonus points
 */

/**
 * @param {Card} card
 * @returns {VNode}
 * @constructor
 */
export function CardView(card) {
    return h('div.card', {}, card.name)
}
