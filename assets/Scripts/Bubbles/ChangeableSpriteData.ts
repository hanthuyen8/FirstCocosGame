const { ccclass, property } = cc._decorator;

@ccclass("ChangeableSpriteData")
export default class ChangeableSpriteData
{
    @property()
    public id: string = "";

    @property({ type: cc.SpriteFrame })
    public spriteFrame: cc.SpriteFrame = new cc.SpriteFrame();
}
