// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import LevelManager from "./LevelManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HideInLevel extends cc.Component {

    @property()
    private levelIds: string[] = []
    
    onLoad()
    {
        //cc.systemEvent.on(LevelManager.LEVEL_CHANGE_EVENT);
    }

    onDestroy()
    {

    }
}
