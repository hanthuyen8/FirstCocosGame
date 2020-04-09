// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import FadeInData from "../FadeInData";
import Assert from "../Assert";
import Chains from "../Chain";
import Interactable from "../Interfaces/Interactable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level extends cc.Component
{
    @property([FadeInData])
    private willFadeIn: FadeInData[] = []

    @property
    private waitTimeBetweenNode = 0.7;

    private _allInteractables: Interactable[] = [];

    private _isLevelLoaded = false;
    private _id: number;

    onLoad()
    {
        Assert.isNotEmpty(this.willFadeIn);
        this.generatingData();
    }

    public init(levelId: number)
    {
        this._id = levelId;
    }

    public show()
    {
        this.resetLevel();
        this.node.active = true;

        let chains = new Chains("Level" + this._id);
        for (let i of this.willFadeIn)
        {
            chains.add(
                Chains.fadeIn(chains, i.anyNode, i.fadeSpeed),
                Chains.wait(chains, this.waitTimeBetweenNode));
        }
        chains.add(() => { this.enableInteractables(); chains.done() });
        chains.play();
    }

    public hide()
    {
        Chains.stop("Level" + this._id);
        this.node.active = false;
    }

    private generatingData()
    {
        if (this._isLevelLoaded)
            return;

        this.willFadeIn = FadeInData.regenerateNewFadeIn(this.willFadeIn);
        this._allInteractables = this.node.getComponentsInChildren(Interactable);
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
