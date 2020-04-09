// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export default class Chains
{
    private static _allActiveChains: Map<string, Chains> = new Map;
    private _chains: Function[] = [];
    private _index = 0;
    private _id = "";

    constructor(id: string)
    {
        if (Chains._allActiveChains.has(id))
            throw new Error("Chains này đã tồn tại.");
        
        this._id = id;
        Chains._allActiveChains.set(id, this);
    }

    public play()
    {
        this._chains[0]();
    }

    public add(...chains: Function[])
    {
        for (let i of chains)
        {
            this._chains.push(i);
        }
    }

    public done()
    {
        if (this._index + 1 < this._chains.length)
        {
            this._index++;
            this._chains[this._index]();
        }
        else
        {
            this.stop();
        }
    }

    public stop()
    {
        this._index = this._chains.length;
        Chains._allActiveChains.delete(this._id);
    }

    public static stop(id: string)
    {
        if (Chains._allActiveChains.has(id))
        {
            let c = Chains._allActiveChains.get(id);
            c.stop();
        }
    }

    // Helper
    public static bouncing(base: Chains, node: cc.Node, scaleRate: number, repeat: number): Function
    {
        repeat = Math.max(1, repeat);

        let tween = cc.tween(node)
            .repeat(repeat, cc.tween()
                .to(0.5, { scale: scaleRate })
                .to(0.5, { scale: 1 }))
            .call(() =>
            {
                if (base)
                    base.done();
            });

        return () => tween.start();
    }

    public static fadeIn(base: Chains, anyNode: cc.Node, fadeSpeed: number): Function
    {
        anyNode.opacity = 0;

        let tween = cc.tween(anyNode)
            .to(fadeSpeed, { opacity: 255 }).call(() => 
            {
                if (base)
                    base.done();
            });

        return () => tween.start();
    }

    public static moveToNode(base: Chains, anyNode: cc.Node, duration: number,
        target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO): Function
    {
        let targetWorldPos = target.parent.convertToWorldSpaceAR(target.getPosition());
        let targetLocalPos = anyNode.parent.convertToNodeSpaceAR(targetWorldPos);
        // optional
        targetLocalPos.x += delta.x;
        targetLocalPos.y += delta.y;

        let tween = cc.tween(anyNode)
            .to(duration, { position: targetLocalPos })
            .call(() =>
            {
                if (base)
                    base.done();
            });

        return () => tween.start();
    }

    public static moveToPosition(base: Chains, anyNode: cc.Node, duration: number, toPosition: cc.Vec2): Function
    {
        let tween = cc.tween(anyNode)
            .to(duration, { position: toPosition }).call(() => 
            {
                if (base)
                    base.done();
            });

        return () => tween.start();
    }

    public static parallel(...funcs: Function[]): Function
    {
        return () =>
        {
            for (let f of funcs)
            {
                if (f != undefined)
                    f();
            }
        }
    }

    public static wait(base: Chains, second: number): Function
    {
        return () => setTimeout(() =>
        {
            if (base)
                base.done();
        }, second * 1000);
    }
}
