export default class PromiseHelper
{
    public static newBasePromise()
    {
        let cancelHandler;
        let promise = new Promise<string>((resolve, reject) =>
        { 
            cancelHandler = reject;
            resolve();
        });

        return { promise, cancelHandler };
    }

    public static bouncing(node: cc.Node, scaleRate: number, repeat: number) : Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            /* if (!node.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            } */
            cc.log("bouncing promise: " + node.name);
            repeat = Math.max(1, repeat);
            cc.tween(node)
                .repeat(repeat, cc.tween()
                    .to(0.5, { scale: scaleRate })
                    .to(0.5, { scale: 1 }))
                .call(resolve)
                .start();
        });
    }

    public static fadeIn(anyNode: cc.Node, fadeSpeed: number): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            /* if (!anyNode.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            } */
            cc.log("fadeIn promise: " + anyNode.name);
            anyNode.opacity = 0;
            cc.tween(anyNode)
                .to(fadeSpeed, { opacity: 255 })
                .call(resolve)
                .start();
        });
    }

    public static moveToPosition(anyNode: cc.Node, duration: number, toPosition: cc.Vec2): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            /* if (!anyNode.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            } */
            cc.log("moveToPosition promise: " + anyNode.name);
            cc.tween(anyNode)
                .to(duration, { position: toPosition })
                .call(resolve)
                .start();
        });
    }

    public static moveToNode(anyNode: cc.Node, duration: number, target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO)
    {
        let targetWorldPos = target.parent.convertToWorldSpaceAR(target.getPosition());
        let targetLocalPos = anyNode.parent.convertToNodeSpaceAR(targetWorldPos);
        // optional
        targetLocalPos.x += delta.x;
        targetLocalPos.y += delta.y;
        cc.tween(anyNode)
            .to(duration, { position: targetLocalPos })
            .start();
    }

    public static moveToNodeCallback(anyNode: cc.Node, duration: number, target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            /* if (!anyNode.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            } */
            cc.log("moveToNode promise: " + anyNode.name);
            let targetWorldPos = target.parent.convertToWorldSpaceAR(target.getPosition());
            let targetLocalPos = anyNode.parent.convertToNodeSpaceAR(targetWorldPos);
            // optional
            targetLocalPos.x += delta.x;
            targetLocalPos.y += delta.y;
            cc.tween(anyNode)
                .to(duration, { position: targetLocalPos })
                .call(resolve)
                .start();
        });
    }

    public static runParallel(callback: Promise<string>, ...theRest: (() => void)[]): Promise<string>
    {
        for (let f of theRest)
        {
            f();
        }
        return callback;
    }

    public static wait(second: number): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            setTimeout(resolve, second * 1000);
        });
    }
}
