// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import MouseInput from "./MouseInput";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Drag extends cc.Component implements IInteractable
{
    @property({ displayName: "Interactable" })
    private acceptRaycast = true;

    @property()
    private dragId: string = "";

    @property({ type: cc.AudioClip })
    private clickSound: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private dropSound: cc.AudioClip = null;

    // Other Variables

    public static beingDrag: Drag;

    get id(): string { return this.dragId; }

    get interactable(): boolean { return this.acceptRaycast; }

    set interactable(value: boolean)
    {
        this.acceptRaycast = value;
        if (value)
            this.subscribeInputEvents();
        else
            this.unsubscribeInputEvents();
    }

    private _originalPosition: cc.Vec2;
    private _isDragging: boolean;

    onLoad()
    {
        this._originalPosition = this.node.getPosition();
        this.subscribeInputEvents();
    }

    onDestroy()
    {
        this.unsubscribeInputEvents();
    }

    public restorePosition()
    {
        this.node.setPosition(this._originalPosition);
    }

    private onBeginDrag()
    {
        this._isDragging = true;
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onDrag, this);
        Drag.beingDrag = this;

        if (this.clickSound)
        {
            cc.audioEngine.playEffect(this.clickSound, false);
        }
    }

    private onDrag()
    {
        if (!this._isDragging)
            return;

        var newPosition = this.node.parent.convertToNodeSpaceAR(MouseInput.position);
        this.node.setPosition(newPosition);
    }

    private onEndDrag()
    {
        this._isDragging = false;
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onDrag, this);
        Drag.beingDrag = null;

        this.node.setPosition(this._originalPosition);

        if (this.dropSound)
        {
            cc.audioEngine.playEffect(this.dropSound, false);
        }
    }

    private subscribeInputEvents()
    {
        if (!this.acceptRaycast)
            return;

        this.node.on(cc.Node.EventType.TOUCH_START, this.onBeginDrag, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onEndDrag, this);
    }

    private unsubscribeInputEvents()
    {
        if (!this.acceptRaycast)
            return;

        this.node.off(cc.Node.EventType.TOUCH_START, this.onBeginDrag, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onEndDrag, this);
    }
}
