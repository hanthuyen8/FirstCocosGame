// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Helper from "../Helper";
import Assert from "../Assert";
import Interactable from "../Interfaces/Interactable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HoverEffect extends Interactable
{
    @property(cc.Node)
    private hoverLayer: cc.Node = null;

    @property
    private hoverSpeed: number = 0.3;
    
    private _thisTween: cc.Tween<unknown>;

    onLoad()
    {
        Assert.isNotNull(this.hoverLayer);
        this.hoverLayer.opacity = 0;
    }

    start()
    {
        cc.log(this.name+ " " + this.interactable);
    }

    public startHoverEffect()
    {
        this.stopTween();

        this._thisTween = cc.tween(this.hoverLayer).repeatForever(
            cc.tween()
                .to(0.3, { opacity: 255 })
                .to(0.3, { opacity: 0 })
        ).start();
    }

    public stopHoverEffect()
    {
        this.stopTween();
        this.hoverLayer.opacity = 0;
    }

    public startClickEffect()
    {
        this.stopTween();
        this.hoverLayer.opacity = 255;
    }

    public stopClickEffect(event: cc.Event.EventTouch)
    {
        this.stopTween();
        this.hoverLayer.opacity = 0;

        if (cc.sys.platform == cc.sys.DESKTOP_BROWSER && event != null)
        {
            let localPositionOfMouse = this.node.parent.convertToNodeSpaceAR(event.getLocation());
            if (this.node.getBoundingBox().contains(localPositionOfMouse))
            {
                this.startHoverEffect();
            }
        }
    }

    private stopTween()
    {
        if (this._thisTween)
        {
            this._thisTween.stop();
            this._thisTween = null;
        }
    }

    protected subscribeInputEvents()
    {
        cc.log("sub");
        this.unsubscribeInputEvents();
        if (cc.sys.platform == cc.sys.DESKTOP_BROWSER)
        {
            this.node.on(cc.Node.EventType.MOUSE_ENTER, this.startHoverEffect, this);
            this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.stopHoverEffect, this);
        }
        this.node.on(cc.Node.EventType.TOUCH_START, this.startClickEffect, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.stopClickEffect, this);
    }

    protected unsubscribeInputEvents()
    {
        cc.log("unsub");
        if (cc.sys.platform == cc.sys.DESKTOP_BROWSER)
        {
            this.node.off(cc.Node.EventType.MOUSE_ENTER, this.startHoverEffect, this);
            this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.stopHoverEffect, this);
        }
        this.node.off(cc.Node.EventType.TOUCH_START, this.startClickEffect, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.stopClickEffect, this);
        this.stopHoverEffect();
    }
}
