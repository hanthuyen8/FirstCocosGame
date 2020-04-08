// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Interactable from "./Interactable";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Sample extends Interactable
{
    
    subscribeInputEvents(): void
    {
        throw new Error("Method not implemented.");
    }
    unsubscribeInputEvents(): void
    {
        throw new Error("Method not implemented.");
    }

}
