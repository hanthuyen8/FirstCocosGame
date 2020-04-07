// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Chains from "./Chain";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    node1: cc.Node = null;

    @property(cc.Node)
    node2: cc.Node = null;

    @property(cc.Node)
    node3: cc.Node = null;

    start()
    {
        let chains = new Chains();
        chains.add(
            Chains.bouncing(chains, this.node1, 3, 10),
            Chains.bouncing(chains, this.node2, 2, 10),
            Chains.fadeIn(chains, this.node3, 10)
        );
        chains.play();
    }
}
