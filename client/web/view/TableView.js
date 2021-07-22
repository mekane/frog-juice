import {h} from "snabbdom";
import {CardView} from "./CardView";

export function TableView(table) {
    const cards = table.map(CardView);

    return h('div.table.zone.card-list', {}, [h('header', 'Table')].concat(cards))
}
