import {
    init,
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

    function update(state, phaseDescription) {
        console.log('update', state);

        const phaseHeader = h('h1', {}, phaseDescription)
        const deckView = DeckView(state.deck)
        const tableView = TableView(state.table)
        const playerViews = mapViews(state.players.byId)

        const updatedView = h('div', {}, [
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

function mapViews(playersById) {
    return Object.keys(playersById).map(id => {
        const player = playersById[id];
        if (player.type === 'human')
            return PlayerView(player)
        else
            return PlayerSummary(player)
    })
}