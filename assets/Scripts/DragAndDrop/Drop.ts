// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Drag from "./Drag";
import DropResult from "./DropResult";
import Assert from "../Assert";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Drop extends cc.Component
{
    @property({ tooltip: "Để trống nếu muốn Drop này nhận tất cả các DragId" })
    private acceptedDragId: string = "";

    public static readonly ON_DROP_EVENT = "ON_DROP_EVENT";

    private _lastDetectedDrag: Drag;

    onLoad()
    {
        this.node.on(cc.Node.EventType.MOUSE_UP, this.onDrop, this);
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);

        this.acceptedDragId = this.acceptedDragId.trim();
    }

    onDestroy()
    {
        this.node.off(cc.Node.EventType.MOUSE_UP, this.onDrop, this);
        this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    private onMouseEnter()
    {
        this._lastDetectedDrag = Drag.beingDrag;
    }

    private onMouseLeave()
    {
        this._lastDetectedDrag = null;
    }

    private onDrop()
    {
        if (this._lastDetectedDrag)
        {
            let result: boolean = false;
            if (this.acceptedDragId == "")
            {
                // Nhận mọi DragId
                result = true;
            }
            else if(this.acceptedDragId == this._lastDetectedDrag.id)
            {
                // Chỉ nhận DragId nào trùng với acceptedDragId
                result = true;
            }
            cc.log(result);
            cc.systemEvent.emit(Drop.ON_DROP_EVENT, new DropResult(result, this._lastDetectedDrag, this));
        }
    }

}
