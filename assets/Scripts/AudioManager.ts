// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioData from "./AudioData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component
{
    public static get instance(): AudioManager { return this._instance; }

    @property({ type: cc.AudioClip })
    public backgroundMusic: cc.AudioClip = null;

    @property()
    public musicVolume: number = 0.2;

    @property({ type: [AudioData] })
    public data: AudioData[] = []

    private static _instance: AudioManager = null;

    private _dataDict: Map<string, AudioMeta> = new Map;

    onLoad()
    {
        if (this.isSingletonAlreadyLoaded())
            return;

        this.detectInput();

        for (let i of this.data)
        {
            if (this._dataDict.has(i.audioName))
            {
                throw new Error("Không được phép có audio trùng id: " + i.audioName);
            }

            this._dataDict.set(i.audioName, new AudioMeta(i.audioClip));
        }
    }

    private detectInput()
    {
        cc.Canvas.instance.node.once(cc.Node.EventType.TOUCH_START, () => cc.audioEngine.stopAllEffects());
    }

    start()
    {
        if (this.backgroundMusic)
        {
            cc.audioEngine.setMusicVolume(this.musicVolume);
            cc.audioEngine.playMusic(this.backgroundMusic, true);
        }
    }

    public play(audioId: string, callback: Function = null)
    {
        if (this._dataDict.has(audioId))
        {
            let data = this._dataDict.get(audioId);
            if (data.isPlaying)
                cc.audioEngine.stopEffect(data.playId);

            data.playId = cc.audioEngine.playEffect(data.audioClip, false);
            cc.audioEngine.setFinishCallback(data.playId, () =>
            {
                data.reset();
                if (callback)
                    callback();
            });
        }
    }

    public chain(audioId: string, callback: Function = null): Function
    {
        return () => this.play(audioId, callback);
    }

    public stop(audioId: string)
    {
        if (this._dataDict.has(audioId))
        {
            let data = this._dataDict.get(audioId);
            if (data.isPlaying)
            {
                cc.audioEngine.stopEffect(data.playId);
                data.reset();
            }
        }
    }

    public resumeBackgroundMusic()
    {
        if (this.backgroundMusic)
            cc.audioEngine.resumeMusic();
    }

    public pauseBackgroundMusic()
    {
        if (this.backgroundMusic)
            cc.audioEngine.pauseMusic();
    }

    private toggleBackgroundMusic(toggle: cc.Toggle)
    {
        if (this.backgroundMusic)
        {
            if (toggle.isChecked)
                cc.audioEngine.resumeMusic();
            else
                cc.audioEngine.pauseMusic();
        }
    }

    private isSingletonAlreadyLoaded(): boolean
    {
        if (AudioManager._instance == null || AudioManager._instance == undefined)
        {
            AudioManager._instance = this;
            return false;
        }
        else
        {
            this.destroy();
            return true
        }
    }
}

class AudioMeta
{
    public get isPlaying(): boolean { return this.playId !== -1 }
    public audioClip: cc.AudioClip;
    public playId: number;

    constructor(audioClip: cc.AudioClip)
    {
        this.playId = -1;
        this.audioClip = audioClip;
    }

    public reset()
    {
        this.playId = -1;
    }
}
