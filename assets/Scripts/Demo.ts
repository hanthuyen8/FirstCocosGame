// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import FadeInData from "./FadeInData";
import AudioData from "./AudioData";
import MouseInput from "./DragAndDrop/MouseInput";
import HoverEffect from "./HoverAndClick/HoverEffect";
import ButtonColor, { ButtonState } from "./HoverAndClick/ButtonColor";
import PromiseHelper from "./PromiseHelper";
import Assert from "./Assert";
import TweenSequence, { NTween } from "./TweenSequence";
import Chains from "./Chain";
import AudioManager from "./AudioManager";

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
    private bubble: cc.Node = null;

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
        let moveMouseDownABit = cc.v2(0, -30);
        this.node.active = true;

        let audioManager = AudioManager.instance;
        let chains = new Chains("Demo");
        chains.add(
            Chains.wait(chains, 1.5),
            Chains.fadeIn(chains, this.title, 1),
            Chains.parallel(
                audioManager.chain("demo-title"),
                Chains.bouncing(chains, this.title, 1.1, 1)
            ),
            Chains.wait(chains, 1.5),
            Chains.moveToPosition(chains, this.title, 1, this._titleOriginalPos),
            this.fadeInAllNodes(() => chains.done()),
            Chains.parallel(
                () => this.bubble.opacity = 255,
                audioManager.chain("demo-how-to-play", () => chains.done())
            ),
            this.flashingItems("Item", 0.3, 4, () => chains.done()),
            Chains.parallel(
                () => this.cursor.opacity = 255,
                Chains.moveToNode(chains, this.cursor, 0.7, this.drag, moveMouseDownABit)
            ),
            this.hoverDrag(chains, 2),
            this.clickDrag(chains),
            Chains.wait(chains, 1),
            Chains.parallel(
                Chains.moveToNode(null, this.cursor, 1, this.drop, moveMouseDownABit),
                Chains.moveToNode(chains, this.drag, 1, this.drop)
            ),
            this.dropDrag(chains),
            Chains.wait(chains, 0.5),
            this.dragCorrect(chains),
            Chains.wait(chains, 0.5),
            Chains.moveToNode(chains, this.cursor, 1, this.stopButton, moveMouseDownABit),
            Chains.parallel(
                Chains.bouncing(chains, this.stopButton, 1.2, 4),
                audioManager.chain("demo-x-icon")
            ),
            Chains.moveToNode(chains, this.cursor, 1, this.infoButton, moveMouseDownABit),
            Chains.parallel(
                Chains.bouncing(chains, this.infoButton, 1.2, 4),
                audioManager.chain("demo-i-icon")
            ),
            Chains.moveToNode(chains, this.cursor, 1, this.playButton, moveMouseDownABit),
            Chains.parallel(
                Chains.bouncing(chains, this.playButton, 1.2, 4),
                audioManager.chain(this._isFirstPlay ? "demo-start-btn" : "demo-resume-btn")
            )
        );
        chains.play();
    }

    public stop()
    {
        cc.Tween.stopAll();
        Chains.stop("Demo");
        cc.audioEngine.stopAllEffects();
        this._isFirstPlay = false;
        this.node.active = false;
    }
/* 
    private playAudio(chain: Chains, audioName: string, waitToEnd: boolean): Function
    {
        return () =>
        {
            if (!MouseInput.audioCanPlay)
            {
                cc.log("Audio cannot start: " + audioName);
            }
            else
            {
                cc.log("Play audio: " + audioName);
                let obj = this.allAudio.find(x => x.audioName === audioName);
                if (obj)
                {
                    let audioId = cc.audioEngine.playEffect(obj.audioClip, false);
                    this._audioIsPlaying.set(audioId, true);
                    cc.audioEngine.setFinishCallback(audioId, () =>
                    {
                        this._audioIsPlaying.delete(audioId)
                        if (waitToEnd && chain)
                        {
                            chain.done();
                            return;
                        }
                    });
                }
            }
            if (chain)
                chain.done();
        }
    } */

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
    private clickDrag(chain: Chains): Function
    {
        return () =>
        {
            AudioManager.instance.play("click");
            let hover = this.drag.getComponent(HoverEffect);
            if (hover)
            {
                hover.startClickEffect();
            }
            if (chain)
                chain.done();
        }
    }

    private dropDrag(chain: Chains): Function
    {
        return () =>
        {
            AudioManager.instance.play("drop");
            let hover = this.drag.getComponent(HoverEffect);
            if (hover)
            {
                hover.stopClickEffect(null);
            }
            if (chain)
                chain.done();
        }
    }

    private dragCorrect(chain: Chains): Function
    {
        return () =>
        {
            AudioManager.instance.play("answer-correct");
            let buttonState = this.drag.getComponent(ButtonColor);
            if (buttonState)
            {
                buttonState.ChangeState(ButtonState.Correct);
            }
            if (chain)
                chain.done();
        }
    }

    private hoverDrag(chain: Chains, inSecond: number): Function
    {
        return () =>
        {
            let hover = this.drag.getComponent(HoverEffect);
            if (!hover)
            {
                if (chain)
                    chain.done();
                return;
            }
            hover.startHoverEffect();
            setTimeout(() =>
            {
                hover.stopHoverEffect();
                if (chain)
                    chain.done();
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
        this.bubble.opacity = 0;
        this.title.opacity = 0;
        this.title.setPosition(0, 0);
        this.resetDrag();
        if (!this._isFirstPlay)
        {
            // Chane Start Button to Resume Button
        }
    }
}
