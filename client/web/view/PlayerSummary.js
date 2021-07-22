import {h} from "snabbdom";

export function PlayerSummary(player) {
    return h('div.player-summary.zone', {}, player.name + ' Summary')
}
