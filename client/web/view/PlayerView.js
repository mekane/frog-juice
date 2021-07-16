import {h} from "snabbdom";

export function PlayerView(player) {
    return h('div.player', {}, player.name + ' View')
}
