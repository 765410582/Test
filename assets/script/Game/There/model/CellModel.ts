import { math, v2, Vec3 } from "cc";
import { ChessFlag, ChessStatus, ChessType } from "../ConstValue";

export interface Model {
    id: string;
    startx: number;
    starty: number;
    x: number;
    y: number;
    type: ChessType;
    status: ChessStatus;
    flag?: ChessFlag;
    cmd:Object[];
 }
 

export class CellModel{
  
    private _data: Model;
    get id(){
        return this._data.id;
    }
    get startx(){
        return this._data.startx;
    }
    get starty(){
        return this._data.starty;
    }
    get x(){
        return this._data.x;
    }
    set x(_x){
        this._data.x=_x;
    }
    get y(){
        return this._data.y;
    }
    set y(_y){
        this._data.y=_y;
    }
    get type(){
        return this._data.type;
    }
    get status(){
        return this._data.status;
    }
    get flag(){
        return this._data.flag;
    }
    get cmd(){
        return this._data.cmd;
    }
    set cmd(value){
        this._data.cmd = value;
    }
    constructor(data:Model){
        this.setData(data);
    }
    public setData(data:Model){
        this._data = data;
    }
    public getData():Model{
        return this._data;
    }

    setXY(pos2: Vec3) {
        let {x,y}=pos2;
        this._data.x = x;
        this._data.y = y;
    }

    public isMove():boolean{
        throw new Error("没有实现")
    }
    public isClick():boolean{
        throw new Error("没有实现")
    }
    public isConntected():boolean{
        throw new Error("没有实现")
    }

    public isDead():boolean{
        throw new Error("没有实现")
    }

    public BackMove(pos,keepTime=0,playTime=0.2){
        let action1 = {
          action: "moveTo",
          keepTime: keepTime,
          playTime: playTime,
          pos: pos,
        }
        let action2 = {
          action: "moveTo",
          keepTime: keepTime,
          playTime: playTime,
          pos: v2(this.x, this.y),
        }
        let back= [action1, action2];
        this.cmd.push(...back);
    }

    public MoveTo(pos,keepTime=0,playTime=0.2):void{
        let action = {
          action: "moveTo",
          keepTime: keepTime,
          playTime: playTime,
          pos: pos,
        }
        this.cmd.push(action);
    }
    public Dead(keepTime):void{
        let action = {
          action: "dead",
          keepTime: keepTime,
          playTime: 0.2,
          pos: v2(this.x, this.y),
        }
        this.cmd.push(action);
    }
}


