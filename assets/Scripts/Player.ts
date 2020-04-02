// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component
{
    @property
    public jumpHeight: number = 200;

    @property
    public jumpDuration: number = 0.3;

    @property
    public moveSpeed: number = 150;

    private _moveLeft: boolean;
    private _moveRight: boolean;

    onLoad()
    {
        this.node.runAction(this.setJumpAction());

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start()
    {

    }

    update(dt : number)
    {
        if (this._moveLeft || this._moveRight)
        {
            let movement = this.moveSpeed * dt;
            if (this._moveLeft)
                movement *= -1;

            this.node.x += movement;
        }
    }

    onDestroy()
    {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    setJumpAction(): cc.ActionInterval
    {
        let jumpDown: cc.ActionInterval = cc.moveBy(this.jumpDuration, 0, this.jumpHeight).easing(cc.easeCubicActionOut());
        let jumpUp: cc.ActionInterval = cc.moveBy(this.jumpDuration, 0, -this.jumpHeight).easing(cc.easeCubicActionIn());
        let sequence: cc.ActionInterval = cc.sequence(jumpDown, jumpUp);
        return cc.repeatForever(sequence);
    }

    private onKeyDown(event: cc.Event.EventKeyboard)
    {
        switch (event.keyCode)
        {
            case cc.macro.KEY.left:
                this._moveLeft = true;
                this._moveRight = false;
                break;
            case cc.macro.KEY.right:
                this._moveLeft = false;
                this._moveRight = true;
                break;
        }
    }

    private onKeyUp(event: cc.Event.EventKeyboard)
    {

        switch (event.keyCode)
        {
            case cc.macro.KEY.left:
                this._moveLeft = false;
                break;
            case cc.macro.KEY.right:
                this._moveRight = false;
                break;
        }
    }
}
