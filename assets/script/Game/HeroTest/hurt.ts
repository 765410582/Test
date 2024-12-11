import { _decorator, Color, Component, Label, Node, tween, v2, v3, Vec3 } from 'cc';
import { TetrisMgr } from '../Tetris/TetrisMgr';
import { ObjectPoolMgr, PoolType } from '../../frame/ObjectPoolMgr';
import { InsMgr } from '../../frame/InsMgr';
const { ccclass, property } = _decorator;

export interface HrutData {
    hurt: number;
    type: string;
    time?: number;
    speed?: number;
}
export enum HurtType {
    hurt = "hurt",
    heal = "heal",
    normal = "normal"
}
@ccclass('hurt')
export class hurt extends Component {
    param: HrutData;
    node_lable: Label;
    targetNode: Vec3;
    init(param: HrutData) {
        this.param = param;
        this.targetNode = this.node.position;
        this.upateLabelInfo();
        this.moveEffect();
    }

    upateLabelInfo() {
        let { hurt, type, time, speed } = this.param;
        speed = (speed || 1)
        time = (time || 1)
        this.node_lable = this.node.getComponent(Label)
        let size=InsMgr.tool.getformatSize( hurt);
        let label_hurt = "-" +size;
        let color = Color.WHITE;
        this.node_lable.fontSize = 30
        if (type == HurtType.hurt) {//暴击
            color = Color.RED;
            this.node_lable.fontSize = 38
        } else if (type == HurtType.heal) {//回血
            color = Color.GREEN;
            this.node_lable.fontSize = 38
            label_hurt = "+" + size;
        }
        this.node_lable.string = label_hurt;
        this.node_lable.color = color;
    }
    moveEffect() {
        let arr = [['up','down'], ['left','right']]
        let movex = this.moveInDirection(arr[0][Math.floor(Math.random() * arr[0].length)])
        let movey = this.moveInDirection(arr[1][Math.floor(Math.random() * arr[1].length)])
        let targetPos = v3(this.targetNode.x + movex, this.targetNode.y + movey, 0);
        tween(this.node)
            .to(this.param.time, { position: targetPos })
            .call(() => {
                ObjectPoolMgr.instance.put(PoolType.DAMAGE, this.node)
            })
            .start()
    }

    moveInDirection(direction: string) {
        let targetPos = 0;
        let ranodm = Math.random() * 100
        switch (direction) {
            case 'up':
                targetPos = ranodm
                break;
            case 'down':
                targetPos = - ranodm
                break;
            case 'left':
                targetPos = - ranodm
                break;
            case 'right':
                targetPos = ranodm
                break;
        }
        return targetPos;
    }

}




