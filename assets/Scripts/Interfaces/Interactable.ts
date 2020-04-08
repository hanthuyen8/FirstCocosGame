// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class Interactable extends cc.Component
{
    public get interactable(): boolean { return this.acceptRaycast; }
    public set interactable(value: boolean)
    {
        if (this.acceptRaycast !== value)
        {
            this.acceptRaycast = value;
            if (value)
                this.subscribeInputEvents();
            else
                this.unsubscribeInputEvents();

            cc.systemEvent.emit(Interactable.INTERACTABLE_CHANGED_EVENT, this.node, value);
        }
    }
    private static readonly INTERACTABLE_CHANGED_EVENT = "INTERACTABLE_CHANGED_EVENT";

    @property()
    private acceptRaycast: boolean = true;

    onEnable()
    {
        cc.systemEvent.on(Interactable.INTERACTABLE_CHANGED_EVENT, this.interactableChanged, this);
        if (this.interactable)
            this.subscribeInputEvents();
    }

    onDisable()
    {
        cc.systemEvent.off(Interactable.INTERACTABLE_CHANGED_EVENT, this.interactableChanged, this);
    }

    interactableChanged(node: cc.Node, newValue: boolean)
    {
        if (node === this.node)
        {
            this.interactable = newValue;
        }
    }

    protected abstract subscribeInputEvents(): void
    protected abstract unsubscribeInputEvents(): void
}
