import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { TrafficLight } from './TrafficLight';
const { ccclass, property } = _decorator;

@ccclass('RedGreenLightMgr')
export class RedGreenLightMgr extends Component {
    light: TrafficLight=null;
    list: Sprite[]=[];
    numLabel: Label=null;
    init(data?) {
        const lightData = [
            { color: Color.RED, last: 5000 },
            { color: Color.YELLOW, last: 3000 },
            { color: Color.GREEN, last: 4000 },
            { color: Color.YELLOW, last: 2000 },
        ]
        this.light = new TrafficLight(lightData);
        for (let i = 1; i < 4; i++) {
            let node = this.node.getChildByName("item" + i).getComponent(Sprite);
            this.list.push(node);
        }
        this.numLabel = this.node.getChildByName("numLabel").getComponent(Label);
        this.updateTime(0);
        this.schedule(this.updateTime, 0.1);
    }

    updateTime(deltaTime: number) {
        let { color, reman } = this.light.getTrafficLight();
        for (let i = 0; i < this.list.length; i++) {
            let item = this.list[i];
            if (color == Color.RED && i == 0 || color == Color.YELLOW && i == 1 || color == Color.GREEN && i == 2) {
                item.color = color;
            } else {
                item.color = Color.GRAY;
            }
        }
        this.numLabel.string = Math.ceil(reman / 1000).toString();
    }
}

