// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass("FadeInData")
export default class FadeInData
{
    @property(cc.Node)
    public anyNode: cc.Node = null;

    @property()
    public fadeSpeed: number = 0.3;

    @property()
    public includeLevelOneChild: boolean = false;

    private _children: FadeInData[] = null;

    public get children()
    {
        if (!this.includeLevelOneChild)
            return null;
        
        if (this._children == null)
        {
            this._children = [];
            for (let child of this.anyNode.children)
            {
                let newFade = new FadeInData();
                newFade.anyNode = child;
                newFade.fadeSpeed = this.fadeSpeed;
                newFade.includeLevelOneChild = false;
                
                this._children.push(newFade);
            }
        }
        return this._children;
    }

    public static regenerateNewFadeIn(oldData : FadeInData[]) : FadeInData[]
    {
        let newData: FadeInData[] = [];
        for (let item of oldData)
        {
            if (!item.includeLevelOneChild)
            {
                newData.push(item);
            }
            else
            {
                for (let child of item.children)
                {
                    newData.push(child);
                }
            }
        }
        return newData;
    }
}
