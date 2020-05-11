// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import FadeInData from "../FadeInData";
import Assert from "../Assert";
import Interactable from "../Interfaces/Interactable";
import Chains from "../Chains/Chains";

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
    private _levelId: number = Number.MIN_SAFE_INTEGER;

    onLoad()
    {
        Assert.isNotEmpty(this.willFadeIn);
        this.generatingData();
    }

    public init(levelId: number)
    {
        this._levelId = levelId;
    }

    public show()
    {
        this.resetLevel();
        this.node.active = true;

        let chains = new Chains("Level" + this._levelId);
        for (let i of this.willFadeIn)
        {
            chains.addFadeInEffect(i.anyNode, i.fadeSpeed);
            chains.waitForSec(this.waitTimeBetweenNode);
        }
        chains.addFunctions(() => { this.enableInteractables(); chains.done(); });
        chains.play();
    }

    public hide()
    {
        Chains.stop("Level" + this._levelId);
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
