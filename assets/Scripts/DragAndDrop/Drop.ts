// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Drag from "./Drag";
import DropResult from "./DropResult";
import Helper from "../Helper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Drop extends cc.Component
{
    @property({ tooltip: "Để trống nếu muốn Drop này nhận tất cả các DragId" })
    private acceptedDragId: string = "";

    public static readonly ON_DROP_EVENT = "ON_DROP_EVENT";

    onLoad()
    {
        this.acceptedDragId = this.acceptedDragId.trim();
    }

    onEnable()
    {
        cc.systemEvent.on(Drag.DRAG_RELEASE_EVENT, this.onDrop, this);
    }

    onDisable()
    {
        cc.systemEvent.off(Drag.DRAG_RELEASE_EVENT, this.onDrop, this);
    }

    private onDrop(drag: Drag, pos: cc.Vec2)
    {
        let localDragPos = Helper.convertToSameSpace(this.node, drag.node, pos);
        if (!this.node.getBoundingBox().contains(localDragPos))
            return;

        let result: boolean = false;
        if (this.acceptedDragId == "" || this.acceptedDragId == drag.id)
        {
            // Nhận mọi DragId nếu acceptedDragId = ""
            // Chỉ nhận DragId nào trùng với acceptedDragId
            result = true;
        }
        cc.systemEvent.emit(Drop.ON_DROP_EVENT, new DropResult(result, drag, this));
    }

}
