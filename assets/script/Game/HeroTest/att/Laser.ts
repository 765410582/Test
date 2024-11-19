import { _decorator, Color, Component, isValid, Node, size, SpringJoint2D, Sprite, UI, UITransform, v3, Vec2 } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
import { enemy } from '../enemy';
const { ccclass, property } = _decorator;
@ccclass('Laser')
export class Laser extends Component {
    param: any;
    Apk: number = 100;
    isEnemyDie: boolean = false;
    attTime: number = 0.1;
    initTime: number = 0;
    init(param) {
        this.param = param;
        this.node.position = this.param.pos;
        if (!this.isEnemyDie) {
            this.schedule(this.onUpdate, 0.1)
        }
        this.isEnemyDie = true;
    }

    updateNodeHeight(dt) {
        let { pos, target } = this.param;
        if (isValid(target)) {
            let dis = InsMgr.tool.getDisance(pos, target.position);
            this.node.getComponent(UITransform).contentSize = size(dis, 26)
            target.getChildByName("Sprite").getComponent(Sprite).color = Color.YELLOW;
            const angle = InsMgr.tool.getCalculateDegrees(pos, v3(target.position.x + 13, target.position.y, 0));
            this.node.angle = angle + 180;
            this.initTime += dt;
            if (this.initTime > this.attTime) {
                this.attTime = 0;
                target.getComponent(enemy).updatePh(this.Apk);
            }
        } else {
            this.nextTarget();
        }
    }

    onUpdate(dt) {
        if (!this.isEnemyDie) return;
        this.updateNodeHeight(dt)
    }

    nextTarget() {
        this.isEnemyDie = false;
        this.node.getComponent(UITransform).contentSize = size(0, 26)
        this.unschedule(this.onUpdate)
        if (typeof this.param.cb === "function") {
            this.param.cb();
        }
    }


}


