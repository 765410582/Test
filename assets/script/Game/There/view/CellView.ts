import { _decorator, Component, Label, Node, tween, v3, Vec3 } from 'cc';
import { CellModel } from '../model/CellModel';
const { ccclass, property } = _decorator;

@ccclass('CellView')
export class CellView extends Component {
    model: CellModel;
    label:Label;
    init(model) {
        this.model = model;
        this.label = this.node.getChildByName("label").getComponent(Label);
        this.label.string = model.id+"\r\n"+model.x+","+model.y;
    }

    tweenRun(time = 0.5,cb=null) {
        let scale = 0.7;
        let move = tween(this.node)
            .to(time, { scale: v3(scale, scale) })
            .delay(0.1)
            .to(time, { scale: v3(1, 1) })
            .call(() => {
                let { id, x, y } = this.model;
                cb&&cb(this.model);
            })
        move.start();
    }

    updateView(self,data?){
        let cmd=data||this.model.cmd;
        let tweenArr=[];
        let t_keepTime=0;
        for(let i in cmd){
            let {action,keepTime,playTime,pos}=cmd[i];
            if(t_keepTime>0){
                tweenArr.push(tween(this.node).delay(t_keepTime));
            }
            if(action==="moveTo"){
                let xy=self.getXYToPos(pos.x,pos.y);
                let move = tween(this.node).to(playTime, { position: xy })
                tweenArr.push(move);
            }else if(action==="dead"){
                let dead = tween(this.node).to(playTime, { scale: v3(0.1, 0.1) })
                tweenArr.push(dead);
            }
            t_keepTime+=keepTime+playTime;
            console.log("t_keepTime",t_keepTime);
        }
        if (tweenArr.length === 1) {
            tween(this.node).then(tweenArr[0]).start();
        } else if (tweenArr.length > 1) {
            tween(this.node).sequence(...tweenArr).start();
        }
    }

}


