import { _decorator, Component, director, Label, Node } from 'cc';
import { InsMgr } from './InsMgr';
import { l10n } from 'db://localization-editor/l10n'
const { ccclass, property } = _decorator;

export enum TimeType{
    Game=1,
    HeroTouch,
}
export interface ITimeData{
    time:number;
    event:string;
    data?:any;
}
@ccclass('GameTime')
export class GameTime extends Component {
    
    private _time:number=0;
    private _update_time:number=0;
    private _task_time=[];
    timeLabel: Label;
    
    constructor(){
        super();   
    }

    init(){
        this.timeLabel = director.getScene().getChildByPath("Canvas/timeLabel").getComponent(Label);
        this.time=0;
        this.schedule(this.update,0.1);
    }

    protected update(dt: number): void {
        this.time+=dt;
    }

    setTaskTime(key:TimeType,value:ITimeData){
        value.time=value.time+this.time;
        this._task_time.push(value)
    }


    claerTaskTime(){
        this._task_time=[];
    }
    updateOtherTime(){
        this._task_time.forEach((v:ITimeData,k:TimeType)=>{
            let {time ,event,data}=v;
            if(this.time>=time){
                InsMgr.event.emit(event,data);
                this._task_time.splice(k,1);
            }
        })
        
    }

    get time(){
        return this._time;
    }
    set time(v){
        this._time =v
        if(this._update_time!=parseInt(this._time.toString())){
            this._update_time= parseInt(this._time.toString())
            // this.timeLabel.string=l10n.t("time")+this._update_time+"s"
            this.updateCountdown() ;
        }
        this.updateOtherTime();
    }

    updateCountdown() {
        const now = new Date(); // 当前时间
        const target = new Date();
        
        // 设置目标时间为今天的零点
        target.setHours(24, 0, 0, 0);
      
        // 计算剩余时间
        let remainingTime = target.getTime() - now.getTime();
      
        // 如果已过零点，则重新设置为第二天零点
        if (remainingTime <= 0) {
          target.setDate(target.getDate() + 1);
          remainingTime = target.getTime() - now.getTime();
        }
      
        // 计算剩余的小时、分钟和秒
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      
        // 格式化输出
        const countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;//
      
        // 显示倒计时
        // console.log(countdown);

        this.timeLabel.string = countdown
      }
}



