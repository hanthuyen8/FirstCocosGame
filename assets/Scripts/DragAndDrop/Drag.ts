// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Interactable from "../Interfaces/Interactable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Drag extends Interactable
{
    @property()
    private dragId: string = "";

    @property({ type: cc.AudioClip })
    private clickSound: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private dropSound: cc.AudioClip = null;

    // Other Variables
    public static readonly DRAG_RELEASE_EVENT = "DRAG_RELEASE_EVENT";
    public static beingDrag: Drag;

    get id(): string { return this.dragId; }

    private _originalPosition: cc.Vec2;
    private _keepPosition: boolean;

    onLoad()
    {
        this._originalPosition = this.node.getPosition();
    }

    public restorePosition()
    {
        this._keepPosition = false;
        this.node.setPosition(this._originalPosition);
    }

    public keepPositionAt(pos: cc.Vec2)
    {
        this._keepPosition = true;
        this.node.setPosition(pos);
    }

    protected subscribeInputEvents()
    {
        this.unsubscribeInputEvents();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onBeginDrag, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onEndDrag, this);
    }

    protected unsubscribeInputEvents()
    {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onBeginDrag, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onEndDrag, this);
    }

    private onBeginDrag()
    {
        if (Drag.beingDrag)
            return;

        Drag.beingDrag = this;
        this.node.setSiblingIndex(99);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onDrag, this);

        if (this.clickSound)
        {
            cc.audioEngine.playEffect(this.clickSound, false);
        }
    }

    private onDrag(event: cc.Event.EventTouch)
    {
        var newPosition = this.node.parent.convertToNodeSpaceAR(event.getLocation());
        this.node.setPosition(newPosition);
    }

    private onEndDrag()
    {
        Drag.beingDrag = null;
        this.node.setSiblingIndex(0);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onDrag, this);

        cc.systemEvent.emit(Drag.DRAG_RELEASE_EVENT, this, this.node.getPosition());

        if (!this._keepPosition)
            this.restorePosition();

        if (this.dropSound)
        {
            cc.audioEngine.playEffect(this.dropSound, false);
        }
    }
}
