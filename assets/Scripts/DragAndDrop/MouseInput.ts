// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass } = cc._decorator;

@ccclass
export default class MouseInput extends cc.Component
{
    public static position: cc.Vec2;

    onLoad()
    {
        cc.macro.ENABLE_MULTI_TOUCH = false;
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_MOVE, this.onMouseMove, this);
    }

    onDestroy()
    {
        cc.Canvas.instance.node.off(cc.Node.EventType.TOUCH_MOVE, this.onMouseMove, this);
    }

    private onMouseMove(event : cc.Event.EventTouch)
    {
        MouseInput.position = event.getLocation();
    }
}
