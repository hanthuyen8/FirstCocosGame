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

const { ccclass, property } = cc._decorator;

@ccclass
export default class Demo extends cc.Component
{
    @property(cc.Node)
    private title: cc.Node = null;

    @property({ type: [AudioData] })
    private allAudio: AudioData[] = [];

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
    private _audioIsPlaying: Map<number, boolean> = new Map();
    private _cancelDemoPromiseHandler: Function;

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

        let promiseHandler = PromiseHelper.newBasePromise();
        this._cancelDemoPromiseHandler = promiseHandler.cancelHandler;

        promiseHandler.promise
            // Show Title
            .then(() => PromiseHelper.wait(1))
            .then(() => PromiseHelper.fadeIn(this.title, 1))
            .then(() => PromiseHelper.runParallel(
                PromiseHelper.wait(2.5),
                () => PromiseHelper.bouncing(this.title, 1.1, 1),
                () => this.playAudio("title")))
            .then(() => PromiseHelper.moveToPosition(this.title, 1, this._titleOriginalPos))

            // Show All Items And Buttons
            .then(() => this.fadeInAllNodes())
            .then(() => this.bubble.opacity = 255)
            .then(() => this.playAudioCallback("how_to_play"))
            .then(() => this.flashingItems("Item"))

            // Show Cursor
            .then(() => this.cursor.opacity = 255)
            .then(() => PromiseHelper.moveToNodeCallback(this.cursor, .7, this.drag, moveMouseDownABit))
            .then(() => this.hoverDrag(2))
            .then(() => this.clickDrag())
            .then(() => PromiseHelper.wait(1))
            .then(() => PromiseHelper.runParallel(
                PromiseHelper.moveToNodeCallback(this.cursor, 1, this.drop, moveMouseDownABit),
                () => PromiseHelper.moveToNode(this.drag, 1, this.drop)))
            .then(() => this.dropDrag())
            .then(() => PromiseHelper.wait(0.5))
            .then(() => this.dragCorrect())
            .then(() => PromiseHelper.wait(0.5))
            .then(() => PromiseHelper.moveToNodeCallback(this.cursor, 1, this.stopButton, moveMouseDownABit))
            .then(() => PromiseHelper.runParallel(
                PromiseHelper.bouncing(this.stopButton, 1.2, 4),
                () => this.playAudio("stop_btn")))
            .then(() => PromiseHelper.moveToNodeCallback(this.cursor, 1, this.infoButton, moveMouseDownABit))
            .then(() => PromiseHelper.runParallel(
                PromiseHelper.bouncing(this.infoButton, 1.2, 4),
                () => this.playAudio("info_btn")))
            .then(() => PromiseHelper.moveToNodeCallback(this.cursor, 1, this.playButton, moveMouseDownABit))
            .then(() => PromiseHelper.runParallel(
                PromiseHelper.bouncing(this.playButton, 1.2, 30),
                () => this.playAudio(this._isFirstPlay ? "start_btn" : "resume_btn")));
    }

    public stop()
    {
        if (this._cancelDemoPromiseHandler)
            this._cancelDemoPromiseHandler("cancel");
        
        cc.Tween.stopAll();
        this._audioIsPlaying.forEach((v, k) => cc.audioEngine.stopEffect(k));
        this._audioIsPlaying.clear();
        this._isFirstPlay = false;
        this.node.active = false;
    }

    private playAudio(audioName: string)
    {
        if (!MouseInput.audioCanPlay)
        {
            cc.log("Audio cannot start: " + audioName);
            return;
        }

        cc.log("Play audio: " + audioName);
        let obj = this.allAudio.find(x => x.audioName === audioName);
        if (obj)
        {
            let audioId = cc.audioEngine.playEffect(obj.audioClip, false);
            this._audioIsPlaying.set(audioId, true);
            cc.audioEngine.setFinishCallback(audioId, () => this._audioIsPlaying.delete(audioId));
        }
    }

    private playAudioCallback(audioName: string): Promise<unknown>
    {
        return new Promise((resolve, reject) =>
        {
            if (!MouseInput.audioCanPlay)// || !this.node.activeInHierarchy)
            {
                cc.log("Audio cannot start: " + audioName);
                resolve();
                return;
            }

            cc.log("Play audio: " + audioName);
            let obj = this.allAudio.find(x => x.audioName === audioName);
            if (obj)
            {
                let audioId = cc.audioEngine.playEffect(obj.audioClip, false);
                cc.audioEngine.setFinishCallback(audioId, () => { this._audioIsPlaying.delete(audioId); resolve(); });
            }
            else
            {
                reject("Audio not found: " + audioName);
            }
        });
    }

    private fadeInAllNodes(): Promise<unknown>
    {
        return new Promise((resolve, reject) =>
        {
            /* if (!this.node.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            } */
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
                .call(resolve)
                .start();
        });
    }

    private flashingItems(ofGroup: string, fadeSpeed: number = 0.3, repeat: number = 2)
    {
        return new Promise((resolve, reject) =>
        {
            /* if (!this.node.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            } */
            let items = this.willFadeIn.filter(x => x.anyNode.group === ofGroup);
            if (items.length == 0)
            {
                reject("No " + ofGroup + " group found");
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
                    setTimeout(() => sampleTween.clone(thatNode).call(resolve).start(), waitTime * 1000);
                }
                index++;
            }
        });
    }

    //#region Drag Effect
    private clickDrag()
    {
        this.playAudio("click");
        let hover = this.drag.getComponent(HoverEffect);
        if (hover)
        {
            hover.startClickEffect();
        }
    }

    private dropDrag()
    {
        this.playAudio("drop");
        let hover = this.drag.getComponent(HoverEffect);
        if (hover)
        {
            hover.stopClickEffect(null);
        }
    }

    private dragCorrect()
    {
        this.playAudio("correct");
        let buttonState = this.drag.getComponent(ButtonColor);
        if (buttonState)
        {
            buttonState.ChangeState(ButtonState.Correct);
        }
    }

    private hoverDrag(durationInSec: number): Promise<unknown>
    {
        return new Promise((resolve, reject) =>
        {
            let hover = this.drag.getComponent(HoverEffect);
            if (!hover)
            {
                reject("Không tìm thấy component HoverEffect");
                return;
            }
            hover.startHoverEffect();
            setTimeout(() =>
            {
                hover.stopHoverEffect();
                resolve();
            }, durationInSec * 1000);
        });
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
