import {h} from "snabbdom";

export function PlayerSummary(player) {
    return h('div.player-summary', {}, player.name + ' Summary')
}
