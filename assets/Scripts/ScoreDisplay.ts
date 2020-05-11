// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Assert from "./Assert";
import GameController from "./GameController";
import AudioManager from "./AudioManager";
import ChangeableSprite from "./Bubbles/ChangeableSprite";

const { ccclass, property } = cc._decorator;

declare let sendScore: Function;

@ccclass
export default class ScoreDisplay extends cc.Component
{
    @property(cc.Label)
    private scoreLabel: cc.Label = null;

    @property(ChangeableSprite)
    private teacherBubbleSpeech: ChangeableSprite = null;

    @property({ type: [cc.ParticleSystem] })
    private particle: cc.ParticleSystem[] = [];

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
        this.particle.forEach(x => x.resetSystem());
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

        let scoreJSon = new ScoreJson(5,5,5,5);
        scoreJSon.Send();
    }

    hide()
    {
        this.particle.forEach(x => x.stopSystem());
        this.node.active = false;
        AudioManager.instance.resumeBackgroundMusic();
    }
}

//@ccclass("ScoreJson")
class ScoreJson
{
    public total :number = 0;
    public maxscore : number = 0;
    public right : number = 0;
    public score : number = 0;

    constructor(total : number, maxscore : number, right:number, score:number)
    {
        this.total = total;
        this.maxscore = maxscore;
        this.right = right;
        this.score = score;
    }

    public Send()
    {
        sendScore(JSON.stringify(this));
    }
}
