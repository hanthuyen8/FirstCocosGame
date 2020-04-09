// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Interactable from "../Interfaces/Interactable";
import DropResult from "./DropResult";
import Drop from "./Drop";

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

    public get id(): string { return this.dragId; }
    public get dragCount(): number { return this._dragCount; }
    public get dropCount(): number { return this._dropCount; }

    private _originalPosition: cc.Vec2;
    private _keepPosition: boolean;
    private _dragCount = 0;
    private _dropCount = 0;

    onLoad()
    {
        this._originalPosition = this.node.getPosition();
    }

    public reset()
    {
        this.restorePosition();
        this._dragCount = 0;
        this._dropCount = 0;
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
        cc.systemEvent.on(Drop.ON_DROP_EVENT, this.onReceiveDropResult, this);
    }

    protected unsubscribeInputEvents()
    {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onBeginDrag, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onEndDrag, this);
        cc.systemEvent.on(Drop.ON_DROP_EVENT, this.onReceiveDropResult, this);
    }

    private onReceiveDropResult(result: DropResult)
    {
        if (result.drag === this)
        {
            this._dropCount++;
        }
    }

    private onBeginDrag()
    {
        if (Drag.beingDrag)
            return;

        Drag.beingDrag = this;
        this._dragCount++;
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
