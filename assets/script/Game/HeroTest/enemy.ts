import { _decorator, BoxCollider2D, Collider2D, Color, Component, Contact2DType, instantiate, IPhysics2DContact, RigidBody2D, SpringJoint2D, Sprite, v3, Vec3 } from 'cc';


import { InsMgr } from '../../frame/InsMgr';
import { HeroEvent } from './HeroTestMgr';
import { buttlet } from './buttlet/buttlet';
import { hurt, HurtType } from './hurt';
const { ccclass, property } = _decorator;
@ccclass('enemy')
export class enemy extends Component {

    private param: any;
    private pos: Vec3;

    private running: boolean = false;
    private attTime: number = 0;
    private attTimer: number = 0;
    private attMaxTime: number = 0.5;
    private attOpen: boolean = false;
    private sprite: Sprite;
    private collider: Collider2D;
    public isDead: boolean = false;
 
    init(param) {
        this.param = param;
        this.running = false;
        this.isDead = false;
   
        this.pos = this.getStartPos();
        this.node.position = this.pos;
        this.collider = this.node.getComponent(Collider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.sprite = this.node.getChildByName("Sprite").getComponent(Sprite);
        this.schedule(this.onUpdate)
        this.node.getComponent(RigidBody2D).wakeUp();
        this.sprite.color = Color.WHITE;
    }
    /**
* 当碰撞结束后调用
* @param  {Collider} other 产生碰撞的另一个碰撞组件
* @param  {Collider} self  产生碰撞的自身的碰撞组件
*/
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let otherNode = otherCollider.node
        if (otherNode.name == "buttlet") {
            let bullet = otherNode.getComponent(buttlet)
            bullet.clearBullet(this.pos);
            this.dealPhInfo(bullet.getApkInfo());
            this.changeColor(Color.RED);
            this.attTimer = 0;
        }
    }

    changeColor(color) {
        this.attOpen = true;
        this.sprite.color = color;
    }

    dealPhInfo(data) {
        let { Apk, AttAPk, Show } = data;
        this.updatePh(Apk);
        if (Show) {
            this.updatePh(AttAPk, HurtType.hurt);
        }
    }

    updatePh(ph, type = HurtType.normal) {
        if (this.isDead) return;
        let data = { hurt: ph, type: type, time: 1, speed: 20, pos: this.node.position }
        InsMgr.event.emit(HeroEvent.HURT, data);
        this.param.ph -= ph;
        if (this.param.ph <= 0) {
            this.rigidBodySleep();
            this.onDestroy()
            InsMgr.event.emit(HeroEvent.DIEENEMY, { enemy: this.node });
        }
    }

    getStartPos() {
        let { order } = this.param;
        return this.getPos(v3(order.width / 2 - 50, order.height / 2 - 50, 0), v3(-order.width / 2, 0, 0));
    }

    getPos(maxPos, minPos) {
        let x = Math.random() * (maxPos.x - minPos.x) + minPos.x;
        let y = maxPos.y;
        return v3(x, y, 0)
    }

    onUpdate(dt) {
        if (InsMgr.gameinfo.isPause()) return;
        if (this.running) {
            this.attTime += dt;
            if (this.attTime >= this.param.time) {
                this.attTime = 0;
                InsMgr.event.emit(HeroEvent.ATTENEMY, this.param);
            }
        } else {
            this.pos = v3(this.pos.x, this.pos.y - dt * this.param.speed, this.pos.z);
            this.node.position = this.pos;
            let tempPos = this.pos.y - this.param.distance;
            if (tempPos < this.param.heroPos.y) {
                this.running = true;
            }
        }
        if (this.attOpen) {
            this.attRed(dt);
        }

    }

    // 打到敌人
    attRed(dt) {
        this.attTimer += dt
        if (this.attMaxTime < this.attTimer) {
            this.attOpen = false;
            this.sprite.color = Color.WHITE;
        }
    }

    rigidBodySleep(){
        if (this.sprite)
            this.sprite.color = Color.WHITE;
        if (this.node)
            this.node.getComponent(RigidBody2D).sleep()
        if (this.collider)
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    getIndex(){
        return this.param.index;
    }
    protected onDestroy(): void {
        this.running = false;
        this.isDead = true;
        this.unschedule(this.onUpdate);
    }


}


