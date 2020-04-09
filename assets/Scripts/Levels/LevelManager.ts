// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Level from "./Level";
import Assert from "../Assert";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelManager extends cc.Component
{
    @property([Level])
    public levels: Level[] = [];

    public static readonly LEVEL_CHANGE_EVENT = "LEVEL_CHANGE_EVENT";
    public get currentLevelIndex(): number { return this._currentLevelIndex; }
    public get currentLevel(): Level { return this.levels[this._currentLevelIndex]; }

    private _currentLevelIndex: number;

    onLoad()
    {
        Assert.isNotEmpty(this.levels);
        this.hideAllLevels();
    }

    start()
    {
        this.initAllLevelsId();
    }

    public showLevel(index: number)
    {
        let hide = this.isLevelExist(this._currentLevelIndex);
        let show = this.isLevelExist(index);
        this._currentLevelIndex = index;

        this.process(hide, show);
    }

    public showNextLevel()
    {
        let show = this.isLevelExist(this._currentLevelIndex + 1);

        if (show)
        {
            let hide = this.isLevelExist(this._currentLevelIndex);
            this._currentLevelIndex++;
            this.process(hide, show);
        }
    }

    public showPrevLevel()
    {
        let show = this.isLevelExist(this._currentLevelIndex - 1);

        if (show)
        {
            let hide = this.isLevelExist(this._currentLevelIndex);
            this._currentLevelIndex--;
            this.process(hide, show);
        }
    }

    private isLevelExist(index: number): Level
    {
        if (index < 0 || index >= this.levels.length)
            return null;

        return this.levels[index];
    }

    private process(hideThat: Level, showThat: Level)
    {
        if (hideThat)
        {
            hideThat.hide();
        }
        showThat.show();
        cc.systemEvent.emit(LevelManager.LEVEL_CHANGE_EVENT, this._currentLevelIndex)
    }

    private hideAllLevels()
    {
        for (let i of this.levels)
        {
            i.hide();
        }
    }

    private initAllLevelsId()
    {
        for (let i = 0; i < this.levels.length; i++)
        {
            this.levels[i].init(i);
        }
    }

}
