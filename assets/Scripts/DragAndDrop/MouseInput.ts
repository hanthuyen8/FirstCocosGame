// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MouseInput extends cc.Component
{
    //public static readonly MOUSE_UP_EVENT = "MOUSE_UP_EVENT";
    public static position: cc.Vec2;

    private static _canvas : cc.Node;

    onLoad()
    {
        cc.macro.ENABLE_MULTI_TOUCH = false;
        MouseInput._canvas = cc.Canvas.instance.node;
        MouseInput._canvas.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onDestroy()
    {
        MouseInput._canvas.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    private onMouseMove(event : cc.Event.EventMouse)
    {
        MouseInput.position = event.getLocation();
    }
}
