import { _decorator, Component, Node, size, UITransform } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
const { ccclass, property } = _decorator;

@ccclass('Laser')
export class Laser extends Component {
    nextTarget() {
        throw new Error('Method not implemented.');
    }
    param: any;
    Apk:number=10;
    init(param) {
        this.param = param;
        console.log("param:",this.param);
    }

    updateNodeHeight() {
        let { pos, target } = this.param;
        let dis = InsMgr.tool.getDisance(pos, target);
        this.node.getChildByName("Sprite").getComponent(UITransform).contentSize = size(dis, 26)
    }

    update(deltaTime: number) {

    }

    
}


