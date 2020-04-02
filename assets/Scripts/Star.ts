// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameMaster from "./GameMaster";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Star extends cc.Component
{
    @property
    public pickRadius: number = 0;

    private _player: Player;
    private _gameMaster: GameMaster;

    update()
    {
        if (this._player == null)
            return;
        
        if (this.getPlayerDistanceSqr() < Math.pow(this.pickRadius, 2))
        {
            this._gameMaster.spawnNewStar();
            this.node.destroy();
            return;
        }
    }

    public init(gameMaster :GameMaster, player : Player): void
    {
        this._gameMaster = gameMaster;
        this._player = player;
    }

    private getPlayerDistanceSqr(): number
    {
        let playerPosition = this._player.node.getPosition();
        let distance = this.node.getPosition().sub(playerPosition).magSqr();
        return distance;
    }
}
