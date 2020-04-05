// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export interface IInteractable
{
    interactable: boolean;
}

export class InteractableHelper
{
    public static isIInteractable(obj: any): obj is IInteractable
    {
        return obj.interactable != undefined;
    }

    public static getIInteractableFromNodes(nodes: cc.Node[]) : IInteractable[]
    {
        let inters: IInteractable[] = [];

        for (let i of nodes)
        {
            let allComps = i.getComponents(cc.Component);
            for (let comp of allComps)
            {
                if (InteractableHelper.isIInteractable(comp))
                {
                    inters.push(comp);
                }
            }
        }
        return inters;
    }
}