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

export function BrowserView(domElement) {
    let vNode = toVNode(domElement);

    function update(state, phaseDescription, humanPlayerIndex) {
        console.log('update', state);

        const nextView = GameView(state, phaseDescription);
        vNode = patch(vNode, nextView);
    }

    return {
        update
    }
}

function GameView(state, phaseDescription, humanPlayerIndex) {
    console.log('game view component', state, phaseDescription)

    const phaseHeader = h('h1', {}, phaseDescription)

    return h('div', {}, [
        phaseHeader
    ])
}