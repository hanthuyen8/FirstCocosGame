// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import FadeInData from "../FadeInData";
import Assert from "../Assert";
import { IInteractable, InteractableHelper } from "../Interfaces/IInteractable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level extends cc.Component
{
    @property([FadeInData])
    private willFadeIn: FadeInData[] = []

    @property([cc.Node])
    private allInteractables: cc.Node[] = [];

    @property
    private waitTimeBetweenNode = 0.7;

    private _allInteractables: IInteractable[] = [];

    private _isLevelLoaded = false;
    
    onLoad()
    {
        Assert.isNotEmpty(this.willFadeIn);
        Assert.isNotEmpty(this.allInteractables);
        this.generatingData();
    }

    public show()
    {
        this.resetLevel();
        this.node.active = true;

        Promise.resolve()
            .then((resolve) =>
            {
                for (let i = 0; i < this.willFadeIn.length; i++)
                {
                    let that = this.willFadeIn[i];
                    let thatTween = cc.tween(that.anyNode).to(that.fadeSpeed, { opacity: 255 });
                    if (i + 1 >= this.willFadeIn.length)
                    {
                        // last node in allNodes
                        thatTween.call(resolve);
                    }
                    setTimeout(() => thatTween.start(), i * 1000 * (that.fadeSpeed + this.waitTimeBetweenNode));
                }
            })
            .then(() => this.enableInteractables());
    }

    public hide()
    {
        this.node.active = false;
    }

    private generatingData()
    {
        if (this._isLevelLoaded)
            return;
        
        this.willFadeIn = FadeInData.regenerateNewFadeIn(this.willFadeIn);
        this._allInteractables = InteractableHelper.getIInteractableFromNodes(this.allInteractables);
        this._isLevelLoaded = true;
    }

    private resetLevel()
    {
        this.generatingData();
        this.disableInteractables();
        for (let i of this.willFadeIn)
        {
            i.anyNode.opacity = 0;
        }
    }

    public disableInteractables()
    {
        this._allInteractables.forEach(x => x.interactable = false);
    }

    public enableInteractables()
    {
        this._allInteractables.forEach(x => x.interactable = true);
    }
}
