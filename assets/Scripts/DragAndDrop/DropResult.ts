// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Drag from "./Drag";
import Drop from "./Drop";

export default class DropResult
{
    public result: boolean;
    public drag: Drag;
    public drop: Drop;

    constructor(result: boolean, drag: Drag, drop: Drop)
    {
        this.result = result;
        this.drag = drag;
        this.drop = drop;
    }
}
