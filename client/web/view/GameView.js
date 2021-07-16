import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
    toVNode
} from "snabbdom";

const patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule
]);

export function GameView(domElement) {
    let vNode = toVNode(domElement);

    function update(state, phaseDescription, humanPlayerIndex) {
        console.log('update', state);

        const phaseHeader = h('h1', {}, phaseDescription)

        const updatedView = h('div', {}, [
            phaseHeader
        ])

        vNode = patch(vNode, updatedView);
    }

    return {
        update
    }
}
