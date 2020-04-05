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
}
