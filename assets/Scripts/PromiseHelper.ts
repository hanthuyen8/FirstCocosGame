export default class PromiseHelper
{
    public static bouncing(node: cc.Node, scaleRate: number, repeat: number)
    {
        return new Promise((resolve, reject) =>
        {
            if (!node.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            }
            repeat = Math.max(1, repeat);
            cc.tween(node)
                .repeat(repeat, cc.tween()
                    .to(0.5, { scale: scaleRate })
                    .to(0.5, { scale: 1 }))
                .call(resolve)
                .start();
        });
    }

    public static fadeIn(anyNode: cc.Node, fadeSpeed: number): Promise<unknown>
    {
        return new Promise((resolve, reject) =>
        {
            if (!anyNode.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            }
            anyNode.opacity = 0;
            cc.tween(anyNode)
                .to(fadeSpeed, { opacity: 255 })
                .call(resolve)
                .start();
        });
    }

    public static moveToPosition(anyNode: cc.Node, duration: number, toPosition: cc.Vec2): Promise<unknown>
    {
        return new Promise((resolve, reject) =>
        {
            if (!anyNode.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            }
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

    public static moveToNodeCallback(anyNode: cc.Node, duration: number, target: cc.Node, delta: cc.Vec2 = cc.Vec2.ZERO): Promise<unknown>
    {
        return new Promise((resolve, reject) =>
        {
            if (!anyNode.activeInHierarchy)
            {
                reject("Promise cancel");
                return;
            }
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

    public static runParallel(callback: Promise<unknown>, ...theRest: (() => void)[]): Promise<unknown>
    {
        for (let f of theRest)
        {
            f();
        }
        return callback;
    }

    public static wait(second: number): Promise<unknown>
    {
        return new Promise((resolve, reject) =>
        {
            setTimeout(resolve, second * 1000);
        });
    }
}
