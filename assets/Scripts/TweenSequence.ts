// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass } = cc._decorator;

@ccclass
export default class TweenSequence
{
    private _allTweens: NTween[] = [];
    private _tweenIndex = 0;
    private _onFinished: Function = null;

    public play(onFinished: Function)
    {
        if (this._allTweens.length > 0)
            throw new Error("Cannot play tween with 0 items");

        this._tweenIndex = 0;
        this._onFinished = onFinished;
        this.nextTween();
    }

    public addTween(...anyTween: NTween[])
    {
        for (let t of anyTween)
        {
            t.call(() => this.nextTween());
            this._allTweens.push(t);
        }
    }

    public addArrayOfTween(array: NTween[])
    {
        for (let t of array)
        {
            t.call(() => this.nextTween());
            this._allTweens.push(t);
        }
    }

    public addFunction(func: Function)
    {
        this._allTweens.push(
            cc.tween()
                .delay(0)
                .call(() =>
                {
                    func();
                    this.nextTween();
                }));
    }

    private nextTween()
    {
        if (this._tweenIndex + 1 >= this._allTweens.length)
        {
            this._onFinished();
            return;
        }

        this._allTweens[++this._tweenIndex].start();
    }

    // Static Functions

    public static bouncing(node: cc.Node, scaleRate: number, repeat: number): NTween
    {
        cc.log("bouncing tween: " + node.name);
        repeat = Math.max(1, repeat);

        return new NTween(
            cc.tween(node)
                .repeat(repeat, cc.tween()
                    .to(0.5, { scale: scaleRate })
                    .to(0.5, { scale: 1 })));
    }

    public static fadeIn(anyNode: cc.Node, fadeSpeed: number): NTween
    {
        cc.log("fadeIn tween: " + anyNode.name);
        anyNode.opacity = 0;

        return new NTween(
            cc.tween(anyNode)
                .to(fadeSpeed, { opacity: 255 }));
    }

    public static moveToPosition(anyNode: cc.Node, duration: number, toPosition: cc.Vec2): NTween
    {
        cc.log("moveToPosition tween: " + anyNode.name);

        return new NTween(
            cc.tween(anyNode)
                .to(duration, { position: toPosition }));
    }

    public static moveToNode(anyNode: cc.Node, duration: number,
        target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO): NTween
    {
        let targetWorldPos = target.parent.convertToWorldSpaceAR(target.getPosition());
        let targetLocalPos = anyNode.parent.convertToNodeSpaceAR(targetWorldPos);
        // optional
        targetLocalPos.x += delta.x;
        targetLocalPos.y += delta.y;

        return new NTween(
            cc.tween(anyNode)
                .to(duration, { position: targetLocalPos }));
    }

    private static playAudio(audioClip: cc.AudioClip, waitForEnd: boolean, base: TweenSequence): Function
    {
        return () =>
        {
            if (audioClip)
            {
                let audioId = cc.audioEngine.playEffect(audioClip, false);
                if (waitForEnd)
                    cc.audioEngine.setFinishCallback(audioId, base.nextTween);
                else
                    base.nextTween();
            }
            else
                base.nextTween();
        }
    }

    public static wait(second: number): NTween
    {
        return new NTween(
            cc.tween().delay(second));
    }

}

export class NTween
{
    public get isParallel(): boolean { return this._allTweens.length > 0; }
    public get firstTween(): cc.Tween<unknown> { return this._allTweens[0]; }

    private _allTweens: cc.Tween<unknown>[] = [];

    constructor(tween: cc.Tween<unknown> = null)
    {
        if (tween != null)
            this._allTweens.push(tween);
    }

    public call(callback: Function)
    {
        this._allTweens[this._allTweens.length - 1].call(callback);
    }

    public start()
    {
        this._allTweens.forEach(x => x.start());
    }

    public static newParallel(...tweens: Tweenable[]): NTween
    {
        let sequence = new NTween();
        for (let i = 0; i < tweens.length; i++)
        {
            let t = tweens[i];
            if (t instanceof NTween)
            {
                //let t = tweens[i] as NTween;
                if (t.isParallel)
                    throw new Error("Không được phép lồng các Parallel NTween với nhau.");
                else
                    sequence._allTweens.push(t.firstTween);
            }
            else if (t instanceof cc.Tween)
            {
                //let t = tweens[i] as cc.Tween<unknown>;
                sequence._allTweens.push(t);
            }
            else if (t instanceof Function)
            {
                sequence._allTweens.push(
                    cc.tween()
                        .delay(0)
                        .call(t));
            }
        }
        return sequence;
    }
}

type Tweenable = cc.Tween<unknown> | NTween | Function