// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BubbleCharacter from "./BubbleCharacter";
import Assert from "../Assert";
import ChangeableSprite from "./ChangeableSprite";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BubblesController extends cc.Component
{
    public static Instance: BubblesController = null;

    @property([BubbleCharacter])
    private characters: BubbleCharacter[] = [];

    private _charactersMap: Map<string, BubbleCharacter> = null;
    private _activedCharacter: BubbleCharacter = null;

    onLoad()
    {
        if (BubblesController.Instance == null)
        {
            BubblesController.Instance = this;
        }
        else
        {
            this.destroy();
            return;
        }

        Assert.isNotEmpty(this.characters);

        this._charactersMap = new Map();
        for (let char of this.characters)
        {
            if (this._charactersMap.has(char.characterName))
                throw new Error("Bubble không được để trùng CharacterName");
            else
                this._charactersMap.set(char.characterName, char);
        }
    }

    public show(characterName: string, bubbleId: string = null, hideTime: number = 0)
    {
        if (!this._charactersMap.has(characterName))
            throw new Error(`Không tìm thấy Bubble nào có character name: ${characterName}`);

        if (characterName !== this._activedCharacter.characterName)
        {
            this._activedCharacter.character.node.active = false;
        }

        this._activedCharacter = this._charactersMap.get(characterName);
        this._activedCharacter.character.node.active = true;

        if (bubbleId == null)
        {
            this.hideBubble();
        }
        else
        {
            this.scheduleOnce(() =>
                this._activedCharacter.bubble.show(bubbleId), hideTime);
        }
    }

    public hideBubble()
    {
        if (this._activedCharacter)
            this._activedCharacter.bubble.hide();
    }
}


