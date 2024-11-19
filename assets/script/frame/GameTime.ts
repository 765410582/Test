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

    setTaskTime(key:TimeType,data:ITimeData){
        data.time=data.time+this.time;
        this._task_time.push(data)
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
            this.timeLabel.string=l10n.t("time")+this._update_time+"s"
        }
        this.updateOtherTime();
    }
}



