import {
    init,
    attributesModule,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
    toVNode
} from "snabbdom";
import {DeckView} from "./DeckView";
import {TableView} from "./TableView";
import {PlayerView} from "./PlayerView";
import {PlayerSummary} from "./PlayerSummary";

const patch = init([
    attributesModule,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule
]);

/**
 * @param domElement the element to attach the view to
 * @param actionHandler a function to send actions back out of the view
 */
export function GameView(domElement, actionHandler) {
    let vNode = toVNode(domElement);

    function update(state) {
        console.log('update', state);

        const phaseHeader = h('h1', {}, state.phaseSummary)
        const deckView = DeckView(state.deck || [])
        const tableView = TableView(state.table || [])
        const playerViews = mapViews(state.players || {}, state.currentPlayer + '')

        const updatedView = h('div.game-view', {}, [
            phaseHeader,
            deckView,
            tableView,
            playerViews
        ].flat())

        vNode = patch(vNode, updatedView);
    }

    return {
        update
    }
}

function mapViews(players, currentPlayerId) {
    const playersById = players.byId || {};
    return Object.keys(playersById).map(id => {
        const player = playersById[id];
        if (player.type === 'human' && id === currentPlayerId)
            return PlayerView(player)
        else
            return PlayerSummary(player)
    })
}