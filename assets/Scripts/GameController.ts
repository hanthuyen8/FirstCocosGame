// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Drop from "./DragAndDrop/Drop";
import DropResult from "./DragAndDrop/DropResult";
import ButtonColor, { ButtonState } from "./HoverAndClick/ButtonColor";
import Assert from "./Assert";
import LevelManager from "./Levels/LevelManager";
import Demo from "./Demo";
import Helper from "./Helper";
import Drag from "./DragAndDrop/Drag";
import AudioManager from "./AudioManager";
import ChangeableSprite from "./ChangeableSprite";
import ScoreDisplay from "./ScoreDisplay";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component
{
    public static get instance(): GameController { return this._instance; }

    @property(LevelManager)
    private levelManager: LevelManager = null;

    @property(Demo)
    private demo: Demo = null;

    @property(ScoreDisplay)
    private scoreDisplay: ScoreDisplay = null;

    @property(ChangeableSprite)
    private janiceBubbleSpeech: ChangeableSprite = null;

    public get score(): number { return this._score; }

    private static _instance: GameController = null;
    private _score: number = 0;
    private _dragsInCurrentLevel: Drag[] = [];
    private _answeredCountInCurrentLevel: number = 0;

    onLoad()
    {
        if (this.isSingletonAlreadyLoaded())
            return;
        
        Assert.isNotNull(this.levelManager);
        Assert.isNotNull(this.demo);
        Assert.isNotNull(this.scoreDisplay);
        Assert.isNotNull(this.janiceBubbleSpeech);

        cc.systemEvent.on(Drop.ON_DROP_EVENT, this.onSomethingDropped, this);
        cc.systemEvent.on(LevelManager.LEVEL_CHANGE_EVENT, this.onLevelChanged, this);
    }

    start()
    {
        this.showDemo();
    }

    onDestroy()
    {
        cc.systemEvent.off(Drop.ON_DROP_EVENT, this.onSomethingDropped, this);
        cc.systemEvent.off(LevelManager.LEVEL_CHANGE_EVENT, this.onLevelChanged, this);
    }
    //#region Menu
    public startToPlay()
    {
        this.resumePlay();
        this.levelManager.showLevel(0);
    }

    public resumePlay()
    {
        this.hideDemo();
        this.hideScore();
        this.levelManager.node.active = true;
    }

    public restartGame()
    {
        this._score = 0;
        this.showDemo();
    }

    public showDemo()
    {
        this.levelManager.node.active = false;
        this.hideScore();
        this.demo.play();
    }

    public showScore()
    {
        this.levelManager.node.active = false;
        this.hideDemo();
        this.scoreDisplay.node.active = true;
    }

    private hideDemo()
    {
        this.demo.stop();
    }

    private hideScore()
    {
        this.scoreDisplay.node.active = false;
    }
    //#endregion

    private onLevelChanged(levelIndex: number)
    {
        // reset values
        this._dragsInCurrentLevel = [];
        this._answeredCountInCurrentLevel = 0;
        this.janiceBubbleSpeech.hide();
    }

    private onSomethingDropped(eventArg: DropResult)
    {
        this.levelManager.currentLevel.disableInteractables();
        let drag = eventArg.drag;
        let dragNode = drag.node;
        let dropNode = eventArg.drop.node;
        let dropLocalPos = Helper.convertToSameSpace_node(dragNode, dropNode);
        drag.keepPositionAt(dropLocalPos);

        this._dragsInCurrentLevel.push(drag);

        let validating = () =>
        {
            if (eventArg.result === true)
            {
                // Kết quả Drop là chính xác
                drag.getComponent(ButtonColor).ChangeState(ButtonState.Correct);
                AudioManager.instance.play("answer-correct");
                this._score++;
                this.showJaniceBubble(1, true, 0);
            }
            else
            {
                // Kết quả Drop là sai
                drag.getComponent(ButtonColor).ChangeState(ButtonState.Incorrect);
                AudioManager.instance.play("answer-incorrect");

                setTimeout(() =>
                {
                    drag.restorePosition();
                    this.givePlayerAnotherChanceOrNot();
                    this.showJaniceBubble(1, false, this._answeredCountInCurrentLevel);
                }, 1000);
            }
        };

        setTimeout(() => validating(), 1000);
    }

    private givePlayerAnotherChanceOrNot()
    {
        if (++this._answeredCountInCurrentLevel < 2)
        {
            // Give Player 1 more chance
            this.levelManager.currentLevel.enableInteractables();
            this._dragsInCurrentLevel.forEach(x => x.interactable = false);
        }
    }

    private static readonly _status_wellDone = "well-done";
    private static readonly _status_tryAgain = "try-again";
    private static readonly _status_notQuite = "not-quite";
    private showJaniceBubble(afterXSecond: number, howAnswer: boolean, howManyTimePlayerWrong: number)
    {
        let showBubble = () =>
        {
            if (howAnswer)
            {
                this.janiceBubbleSpeech.show(GameController._status_wellDone);
                AudioManager.instance.play(GameController._status_wellDone);
            }
            else if (howManyTimePlayerWrong == 1)
            {
                this.janiceBubbleSpeech.show(GameController._status_tryAgain);
                AudioManager.instance.play(GameController._status_tryAgain);
            }
            else
            {
                this.janiceBubbleSpeech.show(GameController._status_notQuite);
                AudioManager.instance.play(GameController._status_notQuite);
            }
        };

        setTimeout(() => showBubble(), afterXSecond * 1000);
    }

    private isSingletonAlreadyLoaded(): boolean
    {
        if (GameController._instance == null || GameController._instance == undefined)
        {
            GameController._instance = this;
            return false;
        }
        else
        {
            this.destroy();
            return true
        }
    }
}

