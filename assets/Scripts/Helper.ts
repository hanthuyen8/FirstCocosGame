export default class Helper
{
    public static randomVector2(min: cc.Vec2, max: cc.Vec2): cc.Vec2
    {
        let x = Helper.randomRange(min.x, max.x);
        let y = Helper.randomRange(min.y, max.y);
        return new cc.Vec2(x, y);
    }

    public static randomRange(min: number, max: number): number
    {
        return (Math.random() * (max - min)) + min;
    }

    public static convertToSameSpace(base: cc.Node, target: cc.Node, targetPosition : cc.Vec2) : cc.Vec2
    {
        let targetWorldPos = target.parent.convertToWorldSpaceAR(targetPosition);
        return base.parent.convertToNodeSpaceAR(targetWorldPos);
    }

    public static convertToSameSpace_node(base: cc.Node, target: cc.Node) : cc.Vec2
    {
        return Helper.convertToSameSpace(base, target, target.getPosition());
    }

    public static uniqueString(): string
    {
        let thisTime = new Date();
        return `${thisTime.getHours}${thisTime.getMinutes}${thisTime.getSeconds}${thisTime.getMilliseconds}`;
    }
}
