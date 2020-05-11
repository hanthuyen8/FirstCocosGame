import ChangeableSprite from "./ChangeableSprite";

const { ccclass, property } = cc._decorator;

@ccclass("BubbleCharacter")
export default class BubbleCharacter
{
    @property()
    public characterName: string = "";

    @property({ type: cc.Sprite })
    public character: cc.Sprite = null;

    @property(ChangeableSprite)
    public bubble: ChangeableSprite = null;
}
