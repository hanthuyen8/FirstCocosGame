// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Assert from "./Assert";
import Helper from "./Helper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SimpleParticle extends cc.Component
{

    @property({ type: cc.SpriteFrame })
    private spriteFrame: cc.SpriteFrame = null;

    @property
    private lifeTime: number = 1;

    @property
    private maxSize: number = 1.5;

    @property
    private quantity: number = 10;

    @property
    private spawnTime: number = 1;

    private _pool: cc.NodePool = new cc.NodePool();

    private _minSpawnPos: cc.Vec2;
    private _maxSpawnPos: cc.Vec2;
    private _forceStop = false;

    onLoad()
    {
        Assert.isNotNull(this.spriteFrame);
        let parentPos = this.node.getPosition();
        let parentDeltaW = this.node.width / 2;
        let parentDeltaH = this.node.height / 2;

        this._minSpawnPos = cc.v2(parentPos.x - parentDeltaW, parentPos.y - parentDeltaH);
        this._maxSpawnPos = cc.v2(parentPos.x + parentDeltaW, parentPos.y + parentDeltaH);

        for (let i = 0; i < this.quantity; i++)
        {
            let newNode = new cc.Node();
            let sprite = newNode.addComponent(cc.Sprite);
            sprite.spriteFrame = this.spriteFrame;

            this._pool.put(newNode);
        }
    }

    public play()
    {
        this._forceStop = false;
        for (let i = 0; i < this.quantity; i++)
        {
            setTimeout(() => this.spawnParticle(), this.spawnTime + (this.spawnTime * 1000 * i));
        }
    }

    public stop()
    {
        this._forceStop = true;
    }

    private spawnParticle()
    {
        if (this._forceStop)
            return;
        
        let particle = this._pool.get();
        if (particle)
        {
            particle.setParent(this.node);
            particle.setPosition(Helper.randomVector2(this._minSpawnPos, this._maxSpawnPos));
            particle.scale = 0;
            particle.opacity = 255;

            let tween = cc.tween;
            let scaleSize = Helper.randomRange(0.1, this.maxSize);
            tween(particle)
                .to(this.lifeTime / 2, { scale: scaleSize }, { easing: cc.easing.quadIn })
                .to(this.lifeTime / 2, { scale: 1, opacity: 0 })
                .call(() => this._pool.put(particle))
                .start();
        }
    }
}
