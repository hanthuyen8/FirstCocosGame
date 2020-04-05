export default class Assert
{
    public static isNotNull(obj: any): boolean
    {
        if (obj == null)
            throw new Error("Object is null");
        return true;
    }
    public static isNotEmpty(obj: any[]): boolean
    {
        if (obj && obj.length > 0)
            return true;
        else
            throw new Error("Array is null or empty");
    }
}
