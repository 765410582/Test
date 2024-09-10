import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, TiledMap, tween, Tween, v3, Vec3 } from 'cc';
import { LayerManager } from '../test/LayerManager';
import { config, EventType } from '../TestMain';
import { buttlet } from './buttlet';
import { EventMgr } from '../test/EventMgr';


const { ccclass, property } = _decorator;
let self=null;
@ccclass('enemy')
export class enemy extends Component {
    private speed: number = 1000;
    private param: any;
    private pos: Vec3;
    private ph: number = 100;
    private isTweening: boolean = true;
    init(param) {
        this.param = param;
        this.pos = this.getStartPos();
        this.node.position = this.pos;
        this.ph=100*(this.param.buttletLevel+1)
        this.AnimateNodePosition();
        let collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        self=this;
    }
    /**
* 当碰撞结束后调用
* @param  {Collider} other 产生碰撞的另一个碰撞组件
* @param  {Collider} self  产生碰撞的自身的碰撞组件
*/
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "buttlet") {
            if(this.ph==-1000)return;
            this.ph -= otherCollider.node.getComponent(buttlet).Apk;
            if (this.ph <= 0) {
                this.ph=-1000;
                let collider = self.node.getComponent(Collider2D);
                if (collider) {
                    collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                }
                this.scheduleOnce(()=>{
                    self.param.cb();
                    selfCollider.node.destroy();
                },0.05)
            }
            otherCollider.node.destroy()
        } else if (otherCollider.node.name == "hero") {
            this.ph=-1000;
            let collider = self.node.getComponent(Collider2D);
            if (collider) {
                collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
            EventMgr.Instance.displayer(EventType.GameEnd)
        }
    }

    getRandomPos() {
        let { maxPos, minPos } = this.param;
        return this.getPos(maxPos, minPos);
    }
    getStartPos() {
        let { maxPos, minPos } = this.param;
        return this.getPos(maxPos, v3(minPos.x, 0, 0));
    }

    getPos(maxPos, minPos) {
        let x = Math.random() * (maxPos.x - minPos.x) + minPos.x;
        let y = Math.random() * (maxPos.y - minPos.y) + minPos.y;
        return v3(x, y, 0)
    }

    AnimateNodePosition() {
        while (this.isTweening) {
            this.isTweening = false;
            let curPos = this.getRandomPos();
            let dis = this.pos.subtract(curPos).length();
            let time = dis / this.speed;
            if (time > 3) {
                this.pos = curPos;
                tween(this.node)
                    .to(time, { position: curPos })
                    .call(() => {
                        this.isTweening = true;
                        this.AnimateNodePosition()
                    })
                    .start();
            } else {
                this.isTweening = true;
            }
        }
    }
}


