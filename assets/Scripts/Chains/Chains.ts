// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Helper from "../Helper";

export default class Chains
{
    private static _allActiveChains: Map<string, Chains> = new Map;
    private _chains: ChainFunction[] = [];
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
        this._chains[0].function();
    }

    public done()
    {
        if (this._index + 1 < this._chains.length)
        {
            this._index++;
            let next = this._chains[this._index];
            next.function();
            if (next.functionType == ChainFunctionType.Parallel)
                this.done();
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
        cc.log(id);
        if (Chains._allActiveChains.has(id))
        {
            let c = Chains._allActiveChains.get(id);
            c.stop();
        }
    }

    public addFunctions(...callbacks: Function[]): Chains
    {
        for (let func of callbacks)
        {
            this._chains.push(new ChainFunction(func, ChainFunctionType.Sequence));
        }

        return this;
    }

    // Helper
    public addBouncingEffect(node: cc.Node, scaleRate: number, repeat: number): Chains
    {
        let func = ChainFunction.bouncing(node, scaleRate, repeat, () => this.done());
        this.addFunctions(func);
        return this;
    }

    public addFadeInEffect(anyNode: cc.Node, fadeSpeed: number): Chains
    {
        let func = ChainFunction.fadeIn(anyNode, fadeSpeed, () => this.done());
        this.addFunctions(func);
        return this;
    }

    public addMoveToNode(anyNode: cc.Node, duration: number, target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO): Chains
    {
        let func = ChainFunction.moveToNode(anyNode, duration, target, delta, () => this.done());
        this.addFunctions(func);
        return this;
    }

    public addMoveToPosition(anyNode: cc.Node, duration: number, toPosition: cc.Vec2): Chains
    {
        let func = ChainFunction.moveToPosition(anyNode, duration, toPosition, () => this.done());
        this.addFunctions(func);
        return this;
    }

    public dontWait(...noCallbacks: Function[]): Chains
    {
        for (let func of noCallbacks)
        {
            this._chains.push(new ChainFunction(func, ChainFunctionType.Parallel));
        }

        return this;
    }

    public waitForSec(second: number): Chains
    {
        this.addFunctions(() => setTimeout(() => this.done(), second * 1000));
        return this;
    }
}

export class ChainFunction
{
    public function: Function;
    public functionType: ChainFunctionType = ChainFunctionType.Sequence;

    constructor(func: Function, type: ChainFunctionType = ChainFunctionType.Sequence)
    {
        this.function = func;
        this.functionType = type;
    }

    public static moveToNode(anyNode: cc.Node, duration: number, target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO, callback: Function = null): Function
    {
        let targetWorldPos = target.parent.convertToWorldSpaceAR(target.getPosition());
        let targetLocalPos = anyNode.parent.convertToNodeSpaceAR(targetWorldPos);
        // optional
        targetLocalPos.x += delta.x;
        targetLocalPos.y += delta.y;

        let tween = cc.tween(anyNode)
            .to(duration, { position: targetLocalPos })
            .call(callback);

        return () => tween.start();
    }

    public static moveToPosition(anyNode: cc.Node, duration: number, toPosition: cc.Vec2, callback: Function = null): Function
    {
        let tween = cc.tween(anyNode)
            .to(duration, { position: toPosition }).call(callback);

        return () => tween.start();
    }

    public static fadeIn(anyNode: cc.Node, fadeSpeed: number, callback: Function = null): Function
    {
        anyNode.opacity = 0;

        let tween = cc.tween(anyNode)
            .to(fadeSpeed, { opacity: 255 }).call(callback);

        return () => tween.start();
    }

    public static bouncing(node: cc.Node, scaleRate: number, repeat: number, callback: Function = null): Function
    {
        repeat = Math.max(1, repeat);

        let tween = cc.tween(node)
            .repeat(repeat, cc.tween()
                .to(0.5, { scale: scaleRate })
                .to(0.5, { scale: 1 }))
            .call(callback);

        return () => tween.start();
    }
}

enum ChainFunctionType { Sequence, Parallel }
