import { _decorator, Component, RigidBody2D, v2, v3, Vec2, Vec3 } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
import { HeroEvent } from '../HeroTestMgr';
import { ObjectPoolMgr, PoolType } from '../../../frame/ObjectPoolMgr';
const { ccclass, property } = _decorator;
export enum BulletState {
    DEFALT = 0,
    WALL = 1,
    ENEMY = 2
}
@ccclass('buttlet')
export class buttlet extends Component {
    protected param: any;
    protected position: Vec3;
    protected speed: Vec2 = v2(30, 30);
    protected direction: Vec2;
    baseApk: number = 50;
    Apk: number = 50000;
    isStop: boolean = false;
    bulletCount: number = 0;
    state: BulletState = BulletState.DEFALT;
    rigidbody: RigidBody2D;
    suddenAttack: number = 1000;
    suddenAttackRate: number = 0.2;

    init(param) {
        this.param = param;
        let { start, direction, angle, level } = this.param;
        this.node.position = this.position = start;
        this.direction = direction;
        this.node.setRotationFromEuler(0, 0, angle);
        this.state = BulletState.ENEMY;
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.rigidbody.wakeUp();
        this.isStop = false;
        this.Apk = this.baseApk * level;
        let velocity = v2(this.direction.x * this.speed.x * this.param.popupSpeed,
            this.direction.y * this.speed.y * this.param.popupSpeed);
        this.rigidbody.linearVelocity = velocity;
        this.schedule(this.onUpdate);
    }


    onUpdate(dt: number): void {
        if (this.isStop) return;
        this.outOrder();
    }

    // 超出边界
    outOrder() {
        if (this.node.position.x <= -this.param.order.width / 2 ||
            this.node.position.x >= this.param.order.width / 2 ||
            this.node.position.y <= -this.param.order.height / 2 ||
            this.node.position.y >= this.param.order.height / 2) {
            this.state = BulletState.WALL;
            this.clearBullet(this.node.position)
        }
    }


    // 子弹需要清除
    clearBullet(position = null) {
        this.unschedule(this.onUpdate);
        let data = Object.assign({ pos: position, result: this.state }, this.param);
        InsMgr.event.emit(HeroEvent.BULLET, data);
        this.isStop = true;
        ObjectPoolMgr.instance.put(PoolType.BULLET, this.node);
    }

    getApkInfo() {
        let tempApk = this.suddenAttack * this.Apk;
        let show = Math.random() < this.suddenAttackRate ? true : false;
        return { Apk: this.Apk, AttAPk: tempApk, Show: show }
    }

    onDestroy(): void {
        if (this.rigidbody)
            this.rigidbody.sleep();
        this.unschedule(this.onUpdate);
    }
}


