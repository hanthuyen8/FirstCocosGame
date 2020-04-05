// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Helper from "../Helper";
import Assert from "../Assert";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ButtonColor extends cc.Component {

    @property({type : cc.Sprite})
    private background: cc.Sprite = null;

    @property({type : cc.SpriteFrame})
    private normalTexture: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame })
    private correctTexture: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame })
    private incorrectTexture: cc.SpriteFrame = null;
    
    public get state(): ButtonState
    {
        return this._state;
    }
    public set state(newState : ButtonState)
    {
        this.ChangeState(newState);
    }

    private _state: ButtonState;

    onLoad()
    {
        Assert.isNotNull(this.background);
        Assert.isNotNull(this.normalTexture);
        Assert.isNotNull(this.correctTexture);
        Assert.isNotNull(this.incorrectTexture);
        
        this._state = ButtonState.Normal;
    }

    public ChangeState(toState: ButtonState)
    {
        this._state = toState;
        switch (toState)
        {
            case ButtonState.Correct:
                this.background.spriteFrame = this.correctTexture;
                break;
            case ButtonState.Incorrect:
                this.background.spriteFrame = this.incorrectTexture;
                break;
            case ButtonState.Normal:
                this.background.spriteFrame = this.normalTexture;
                break;
        }
    }
}
export const enum ButtonState{ Normal, Incorrect, Correct }
