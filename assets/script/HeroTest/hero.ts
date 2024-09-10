import { _decorator, Component, Node, v3 } from 'cc';
import { ToolHelper } from '../ToolHelper/ToolHelper';
const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends Component {
    param: any;
    moveNum:number=3
    init(param) {
        this.param=param;
        this.node.position=this.getStartPos();
        this.schedule(this.onUpdate,0.05);
        this.initEvent();
    }


    getStartPos(){
        let {maxPos, minPos}=this.param;
        return v3(0,minPos.y+100,0);
    }

   
    onUpdate(deltaTime: number) {
        this.param.cb(this.node.position)
    }

    initEvent(){
        // 滑动操作逻辑
        this.node.parent.on(Node.EventType.TOUCH_MOVE, function (eventTouch) {
            let pos=eventTouch.getDelta()
            let temp=v3(this.node.position.x+pos.x*this.moveNum,this.node.position.y+pos.y*this.moveNum,0);
            this.node.position=temp;
        }, this);
    }

}


