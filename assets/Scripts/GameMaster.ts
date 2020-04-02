// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Player from "./Player";
import Star from "./Star";
import Helper from "./Helper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMaster extends cc.Component
{

    @property({ type: cc.Prefab, tooltip: "Prefab của Star" })
    public starPrefab : cc.Prefab = null;

    @property(Player)
    public player: Player = null;

    @property(cc.Node)
    private ground: cc.Node = null;

    @property()
    private starDuration: number = 10;

    private _spawnMinPoint: cc.Vec2;
    private _spawnMaxPoint: cc.Vec2;

    onLoad()
    { 
        Helper.Assert.isNotNull(this.starPrefab);
        Helper.Assert.isNotNull(this.player);
        Helper.Assert.isNotNull(this.ground);

        let groundPosition = this.ground.getPosition();

        this._spawnMinPoint = new cc.Vec2(groundPosition.x, groundPosition.y);
        this._spawnMaxPoint = new cc.Vec2(groundPosition.x + this.ground.width, groundPosition.y + this.ground.height);
        
        this.spawnNewStar();
    }

    public spawnNewStar()
    {
        let starNode = cc.instantiate(this.starPrefab);
        let star: Star = starNode.getComponent("Star");

        star.init(this, this.player);
        this.node.parent.addChild(starNode);

        let randomPosition = Helper.randomVector2(this._spawnMinPoint, this._spawnMaxPoint);
        starNode.setPosition(randomPosition.x, randomPosition.y);
    }
}

