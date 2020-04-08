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
import Level from "./Levels/Level";
import Demo from "./Demo";
import Helper from "./Helper";
import Drag from "./DragAndDrop/Drag";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component
{
    @property(LevelManager)
    private levelManager: LevelManager = null;

    @property(Demo)
    private demo: Demo = null;

    @property({ type: cc.AudioClip })
    private correctSound: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private incorrectSound: cc.AudioClip = null;

    public get score(): number { return this._score; }
    private _score: number = 0;

    onLoad()
    {
        Assert.isNotNull(this.levelManager);
        Assert.isNotNull(this.demo);
        Assert.isNotNull(this.correctSound);
        Assert.isNotNull(this.incorrectSound);

        cc.systemEvent.on(Drop.ON_DROP_EVENT, this.onSomethingDropped, this);
        this.node.on(LevelManager.LEVEL_CHANGE_EVENT, this.onLevelChanged, this);
    }

    start()
    {
        this.showDemo();
    }

    onDestroy()
    {
        cc.systemEvent.off(Drop.ON_DROP_EVENT, this.onSomethingDropped, this);
        this.node.off(LevelManager.LEVEL_CHANGE_EVENT, this.onLevelChanged, this);
    }

    public startToPlay()
    {
        this.resumePlay();
        this.levelManager.showLevel(0);
    }

    public resumePlay()
    {
        this.demo.stop();
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
        this.demo.play();
    }

    private onLevelChanged(levelIndex: number)
    {
        this.resetAnswerTime();
    }

    private onSomethingDropped(eventArg: DropResult)
    {
        this.levelManager.currentLevel.disableInteractables();
        let drag = eventArg.drag;
        let dragNode = drag.node;
        let dropNode = eventArg.drop.node;
        let dropLocalPos = Helper.convertToSameSpace_node(dragNode, dropNode);
        drag.keepPositionAt(dropLocalPos);
        drag.interactable = false;

        let validating = () =>
        {
            if (eventArg.result === true)
            {
                // Kết quả Drop là chính xác
                drag.getComponent(ButtonColor).ChangeState(ButtonState.Correct);
                cc.audioEngine.playEffect(this.correctSound, false);
            }
            else
            {
                // Kết quả Drop là sai
                drag.getComponent(ButtonColor).ChangeState(ButtonState.Incorrect);
                cc.audioEngine.playEffect(this.incorrectSound, false);

                setTimeout(() =>
                {
                    drag.restorePosition();
                    this.levelManager.currentLevel.enableInteractables();
                    drag.interactable = false;
                }, 1000);
            }
            this.calculateScore(eventArg.result);
        }

        setTimeout(() => validating(), 1000);
    }

    private _answerTime: number = 0;

    private resetAnswerTime()
    {
        this._answerTime = 0;
    }

    private calculateScore(howAnswer: boolean)
    {
        if (howAnswer)
        {
            // Player win this level
            this.levelManager.currentLevel.disableInteractables();
            this._score++;
        }
        else if (++this._answerTime >= 2)
        {
            // Player lose this Level, not allow to answer again
            this.levelManager.currentLevel.disableInteractables();
        }

    }
}

