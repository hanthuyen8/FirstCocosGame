// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Assert from "./Assert";
import GameController from "./GameController";
import ChangeableSprite from "./ChangeableSprite";
import AudioManager from "./AudioManager";
import SimpleParticle from "./SimpleParticle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreDisplay extends cc.Component
{
    @property(cc.Label)
    private scoreLabel: cc.Label = null;

    @property(ChangeableSprite)
    private teacherBubbleSpeech: ChangeableSprite = null;

    @property({ type: [SimpleParticle] })
    private particle: SimpleParticle[] = [];

    onLoad()
    {
        Assert.isNotNull(this.scoreLabel);
        Assert.isNotNull(this.teacherBubbleSpeech);
        Assert.isNotEmpty(this.particle);
    }

    show()
    {
        AudioManager.instance.pauseBackgroundMusic();
        this.node.active = true;
        this.particle.forEach(x => x.play());
        AudioManager.instance.play("cheer");
        let score = GameController.instance.score;
        this.scoreLabel.string = score + "/5";

        switch (true)
        {
            case score <= 2:
                this.teacherBubbleSpeech.show("bad");
                break;
            case score <= 4:
                this.teacherBubbleSpeech.show("good");
                break;
            case score === 5:
                this.teacherBubbleSpeech.show("excellent");
                break;
        }
    }

    hide()
    {
        this.particle.forEach(x => x.stop());
        this.node.active = false;
        AudioManager.instance.resumeBackgroundMusic();
    }
}
