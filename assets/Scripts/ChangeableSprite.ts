// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Assert from "./Assert";
import ChangeableSpriteData from "./ChangeableSpriteData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChangeableSprite extends cc.Component
{

    @property([ChangeableSpriteData])
    private data: ChangeableSpriteData[] = [];

    private sprite: cc.Sprite = null;

    private _dataMap: Map<string, cc.SpriteFrame> = new Map;

    onLoad()
    {
        Assert.isNotEmpty(this.data);

        this.sprite = this.getComponent(cc.Sprite);
        Assert.isNotNull(this.sprite, "Không tìm thấy Component: Sprite");

        for (let i of this.data)
        {
            i.id = i.id.trim();
            if (i.id == "" || this._dataMap.has(i.id))
                throw new Error("Dat không thể có id bị trùng.");

            this._dataMap.set(i.id, i.spriteFrame);
        }
    }

    public hide()
    {
        this.sprite.spriteFrame = null;
    }

    public show(id: string)
    {
        if (!this._dataMap.has(id))
            throw new Error("id: " + id + " không tồn tại.");

        this.sprite.spriteFrame = this._dataMap.get(id);
    }

    public showTimeout(id: string, inSecond: number)
    {
        this.show(id);
        setTimeout(() => this.hide(), inSecond * 1000);
    }
}


