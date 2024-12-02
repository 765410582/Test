import { _decorator, Color, Component, Label, Node, tween, v2, v3 } from 'cc';
import { TetrisMgr } from '../Tetris/TetrisMgr';
import { ObjectPoolMgr } from '../../frame/ObjectPoolMgr';
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
    targetNode: import("cc").math.Vec3;
    moveDuration: number = 0;

    init(param: HrutData) {
        this.param = param;
        this.node_lable = this.node.getComponent(Label)
        this.targetNode = this.node.position;
        this.moveEffect();
    }

    moveEffect() {
        let { hurt, type, time, speed } = this.param;
        speed = (speed || 1)
        time = (time || 1)
        let dis = speed * time;
        this.node_lable.string = "+" + hurt;

        if (type == "hurt") {//暴击
            this.node_lable.color = Color.RED;
        } else if (type == "heal") {//回血
            this.node_lable.color = Color.GREEN;
        } else {//普通攻击
            this.node_lable.color = Color.WHITE;
        }
        this.moveDuration = time;

        let arr = [['up', 'down'], ['left', 'right']]
        let movex = this.moveInDirection(arr[0][Math.floor(Math.random() * arr[0].length)])
        let movey = this.moveInDirection(arr[1][Math.floor(Math.random() * arr[1].length)])
        let targetPos = v3( this.targetNode.x+movex,this.targetNode.y+ movey, 0);
        tween(this.node)
            .to(this.moveDuration, { position: targetPos })
            .call(() => {
                ObjectPoolMgr.instance.put("hurt", this.node)
            })
            .start()
    }

    moveInDirection(direction: string) {
        let targetPos = 0;
        let ranodm=Math.random()*100
        switch (direction) {
            case 'up':
                targetPos =  ranodm
                break;
            case 'down':
                targetPos = - ranodm
                break;
            case 'left':
                targetPos =- ranodm
                break;
            case 'right':
                targetPos =  ranodm
                break;
        }

        return targetPos;
    }

}




