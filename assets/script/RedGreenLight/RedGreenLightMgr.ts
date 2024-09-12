import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { TrafficLight } from './TrafficLight';
import { EventMgr } from '../test/EventMgr';
import { config, EventType } from '../TestMain';
import { ToolHelper } from '../ToolHelper/ToolHelper';
const { ccclass, property } = _decorator;

@ccclass('RedGreenLightMgr')
export class RedGreenLightMgr extends Component {
    light: TrafficLight = null;
    list;
    numLabel: Label[] = [];
    init(data?) {
        const lightData = [
            { color: Color.RED, last: 20000 },
            { color: Color.YELLOW, last: 2000 },
            { color: Color.GREEN, last: 15000 },
            { color: Color.YELLOW, last: 2000 },
        ]
        this.light = new TrafficLight(lightData);
        let dir = ["up", "left", "down", "right"]
        this.list = new Array();
        for (let j = 0; j < dir.length; j++) {
            this.list[j] = new Array();
            for (let i = 1; i < 4; i++) {
                let node = this.node.getChildByPath(dir[j] + "/item" + i).getComponent(Sprite);
                this.list[j].push(node)
            }
            this.numLabel.push(this.node.getChildByPath(dir[j] + "/numLabel").getComponent(Label));
        }


        let reBtn = this.node.getChildByName("reBtn");
        reBtn.on("click", () => {
            EventMgr.Instance.displayer(EventType.GameEnd, {
                page: config.RedGreenLight
            });
        })
        this.updateTime(0);
        this.schedule(this.updateTime, 0.5);
    }

    updateTime(deltaTime: number) {
        let { color, reman } = this.light.getTrafficLight();
        for (let j = 0; j < this.list.length; j++) {
            let temp = this.list[j];
            if (j == 0 || j == 2) {
                this.updateLightColor(temp, color, j)
            } else {
                let tempColor = color;
                if (color == Color.RED) {
                    tempColor = Color.GREEN;
                } else if (color == Color.GREEN) {
                    tempColor = Color.RED;
                }
                this.updateLightColor(temp, tempColor, j)
            }
            this.numLabel[j].string = Math.ceil(reman / 1000).toString();
        }

    }

    updateLightColor(temp, color, j) {
        for (let i = 0; i < temp.length; i++) {
            let item = temp[i];
            if (color == Color.RED && i == 0 || color == Color.YELLOW && i == 1 || color == Color.GREEN && i == 2) {
                item.color = color;
                this.numLabel[j].node.position = item.node.position;
                this.numLabel[j].color = ToolHelper.getInverseColor(color);
            } else {
                item.color = Color.GRAY;
            }
        }
    }
}


