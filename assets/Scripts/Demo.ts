// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import FadeInData from "./FadeInData";
import HoverEffect from "./HoverAndClick/HoverEffect";
import ButtonColor, { ButtonState } from "./HoverAndClick/ButtonColor";
import Assert from "./Assert";
import AudioManager from "./AudioManager";
import Chains, { ChainFunction } from "./Chains/Chains";
import BubblesController from "./Bubbles/BubblesController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Demo extends cc.Component
{
    @property(cc.Node)
    private title: cc.Node = null;

    @property([FadeInData])
    private willFadeIn: FadeInData[] = [];

    @property
    private waitTimeBetweenNode = 0.7;

    @property(cc.Node)
    private cursor: cc.Node = null;

    @property(cc.Node)
    private drag: cc.Node = null;

    @property(cc.Node)
    private drop: cc.Node = null;

    @property(cc.Node)
    private stopButton: cc.Node = null;

    @property(cc.Node)
    private infoButton: cc.Node = null;

    @property(cc.Node)
    private playButton: cc.Node = null;

    private _isFirstPlay: boolean;
    private _dragOriginalPos: cc.Vec2;
    private _titleOriginalPos: cc.Vec2;

    onLoad()
    {
        Assert.isNotNull(this.title);
        Assert.isNotNull(this.cursor);
        Assert.isNotNull(this.drag);
        Assert.isNotNull(this.drop);
        Assert.isNotNull(this.stopButton);
        Assert.isNotNull(this.infoButton);
        Assert.isNotNull(this.playButton);
        this._isFirstPlay = true;
        this._dragOriginalPos = this.drag.getPosition();
        this._titleOriginalPos = this.title.getPosition();

        this.willFadeIn = FadeInData.regenerateNewFadeIn(this.willFadeIn);
    }

    public play()
    {
        this.resetToOriginal();
        this.node.active = true;
        this.demoPlay();
    }

    public stop()
    {
        cc.Tween.stopAll();
        Chains.stop("Demo");
        cc.audioEngine.stopAllEffects();
        this._isFirstPlay = false;
        this.node.active = false;
    }

    private fadeInAllNodes(callback: Function): Function
    {
        return () =>
        {
            let index = 0;
            for (let i = 0; i < this.willFadeIn.length - 1; i++)
            {
                let current = this.willFadeIn[i];
                cc.tween(current.anyNode)
                    .delay(index * (current.fadeSpeed + this.waitTimeBetweenNode))
                    .to(current.fadeSpeed, { opacity: 255 }).start();

                index++;
            }

            let last = this.willFadeIn[this.willFadeIn.length - 1]
            cc.tween(last.anyNode)
                .delay(index * (last.fadeSpeed + this.waitTimeBetweenNode))
                .to(last.fadeSpeed, { opacity: 255 })
                .call(callback)
                .start();
        }
    }

    private flashingItems(ofGroup: string, fadeSpeed: number = 0.3, repeat: number = 2, callback: Function): Function
    {
        return () =>
        {
            let items = this.willFadeIn.filter(x => x.anyNode.group === ofGroup);
            if (items.length == 0)
            {
                callback();
                return;
            }

            let index = 0;
            let sampleTween = cc.tween()
                .repeat(repeat, cc.tween()
                    .to(fadeSpeed, { opacity: 100 })
                    .to(fadeSpeed, { opacity: 255 })
                );

            for (let i = 0; i < items.length; i++)
            {
                let thatNode = this.willFadeIn[i].anyNode;
                let waitTime = index * fadeSpeed * 2 * repeat;
                if (i + 1 < items.length)
                {
                    setTimeout(() => sampleTween.clone(thatNode).start(), waitTime * 1000);
                }
                else
                {
                    // detect last item
                    setTimeout(() => sampleTween.clone(thatNode).call(callback).start(), waitTime * 1000);
                }
                index++;
            }
        }
    }

    //#region Drag Effect
    private clickDrag(callback: Function): Function
    {
        return () =>
        {
            AudioManager.instance.play("click");
            let hover = this.drag.getComponent(HoverEffect);
            if (hover)
            {
                hover.startClickEffect();
            }
            callback();
        }
    }

    private dropDrag(callback: Function): Function
    {
        return () =>
        {
            AudioManager.instance.play("drop");
            let hover = this.drag.getComponent(HoverEffect);
            if (hover)
            {
                hover.stopClickEffect(null);
            }
            callback();
        }
    }

    private dragCorrect(callback: Function): Function
    {
        return () =>
        {
            AudioManager.instance.play("answer-correct");
            let buttonState = this.drag.getComponent(ButtonColor);
            if (buttonState)
            {
                buttonState.ChangeState(ButtonState.Correct);
            }
            callback();
        }
    }

    private hoverDrag(inSecond: number, callback: Function): Function
    {
        return () =>
        {
            let hover = this.drag.getComponent(HoverEffect);
            if (!hover)
            {
                callback();
                return;
            }
            hover.startHoverEffect();
            setTimeout(() =>
            {
                hover.stopHoverEffect();
                callback();
            }, inSecond * 1000);
        }
    }

    private resetDrag()
    {
        this.drag.setPosition(this._dragOriginalPos);
        let buttonState = this.drag.getComponent(ButtonColor);
        if (buttonState)
        {
            buttonState.ChangeState(ButtonState.Normal);
        }
    }
    //#endregion

    private resetToOriginal()
    {
        for (let current of this.willFadeIn)
        {
            current.anyNode.opacity = 0;
        }
        this.cursor.opacity = 0;
        BubblesController.Instance.show("Teacher");
        this.title.opacity = 0;
        this.title.setPosition(0, 0);
        this.resetDrag();
        if (!this._isFirstPlay)
        {
            // Chane Start Button to Resume Button
        }
    }

    private demoPlay()
    {
        let moveMouseDownABit = cc.v2(0, -30);
        let audioManager = AudioManager.instance;

        let chains = new Chains("Demo");
        let onCompleted = () => chains.done();
        chains
            // Title animation
            .waitForSec(1.5)
            .addFadeInEffect(this.title, 1)
            .dontWait(() => audioManager.play("demo-title"))
            .addBouncingEffect(this.title, 1.1, 1)
            .waitForSec(1.5)
            .addMoveToPosition(this.title, 1, this._titleOriginalPos)

            // Show all Items one by one
            .addFunctions(this.fadeInAllNodes(onCompleted))
            .dontWait(() => BubblesController.Instance.show("Teacher", "Demo"))
            .addFunctions(audioManager.chain("demo-how-to-play", onCompleted))
            .addFunctions(this.flashingItems("Item", 0.3, 4, onCompleted))

            // Move cursor + drag & drop
            .dontWait(() => this.cursor.opacity = 255)
            .addMoveToNode(this.cursor, 0.7, this.drag, moveMouseDownABit)
            .addFunctions(this.hoverDrag(2, onCompleted))
            .addFunctions(this.clickDrag(onCompleted))
            .waitForSec(1)
            .dontWait(ChainFunction.moveToNode(this.cursor, 1, this.drop, moveMouseDownABit))
            .addMoveToNode(this.drag, 1, this.drop)
            .addFunctions(this.dropDrag(onCompleted))
            .waitForSec(0.5)
            .addFunctions(this.dragCorrect(onCompleted))
            .waitForSec(0.5)

            // Move cursor to all Buttons
            .addMoveToNode(this.cursor, 1, this.stopButton, moveMouseDownABit)
            .dontWait(() => audioManager.play("demo-x-icon"))
            .addBouncingEffect(this.stopButton, 1.2, 4)
            .addMoveToNode(this.cursor, 1, this.infoButton, moveMouseDownABit)
            .dontWait(() => audioManager.play("demo-i-icon"))
            .addBouncingEffect(this.infoButton, 1.2, 4)
            .addMoveToNode(this.cursor, 1, this.playButton, moveMouseDownABit)
            .dontWait(() => audioManager.play(this._isFirstPlay ? "demo-start-btn" : "demo-resume-btn"))
            .addBouncingEffect(this.playButton, 1.2, 4)
            .play();
    }
}
