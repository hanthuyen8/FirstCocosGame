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
    private _allTweens: cc.Tween<unknown>[] = [];
    private _tweenIndex = 0;
    private _onFinished: Function = null;

    public play(onFinished : Function)
    {
        this._tweenIndex = 0;
        this._onFinished = onFinished;
        this._allTweens[this._tweenIndex].start();
    }

    public addTween(...anyTween: cc.Tween<unknown>[])
    {
        for (let t of anyTween)
        {
            t.call(() => this.nextTween());
            this._allTweens.push(t);
        }
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
    public static bouncing(node: cc.Node, scaleRate: number, repeat: number): cc.Tween<unknown>
    {
        cc.log("bouncing tween: " + node.name);
        repeat = Math.max(1, repeat);

        return cc.tween(node)
            .repeat(repeat, cc.tween()
                .to(0.5, { scale: scaleRate })
                .to(0.5, { scale: 1 })
            );
    }

    public static fadeIn(anyNode: cc.Node, fadeSpeed: number): cc.Tween<unknown>
    {
        cc.log("fadeIn tween: " + anyNode.name);
        anyNode.opacity = 0;

        return cc.tween(anyNode)
            .to(fadeSpeed, { opacity: 255 });
    }

    public static moveToPosition(anyNode: cc.Node, duration: number, toPosition: cc.Vec2): cc.Tween<unknown>
    {
        cc.log("moveToPosition tween: " + anyNode.name);

        return cc.tween(anyNode)
            .to(duration, { position: toPosition });
    }

    public static moveToNode(anyNode: cc.Node, duration: number, target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO): cc.Tween<unknown>
    {
        let targetWorldPos = target.parent.convertToWorldSpaceAR(target.getPosition());
        let targetLocalPos = anyNode.parent.convertToNodeSpaceAR(targetWorldPos);
        // optional
        targetLocalPos.x += delta.x;
        targetLocalPos.y += delta.y;

        return cc.tween(anyNode)
            .to(duration, { position: targetLocalPos });
    }

    public static wait(second: number): cc.Tween<unknown>
    {
        return cc.tween().delay(second);
    }

}
