import { _decorator, Component, RigidBody2D,v2, v3, Vec2, Vec3 } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
import { HeroEvent } from '../HeroTestMgr';
import { ObjectPoolMgr } from '../../../frame/ObjectPoolMgr';
import { BulletPoolPath } from './ButtletMgr';
const { ccclass, property } = _decorator;
export enum BulletState {
    DEFALT = 0,
    WALL = 1,
    ENEMY = 2
}
@ccclass('buttlet')
export class buttlet extends Component {
    private param: any;
    private position: Vec3;
    private speed: Vec2 = v2(30, 30);
    private direction: Vec2;
    Apk: number = 50;
    isStop: boolean = false;
    bulletCount: number = 0;
    state: BulletState = BulletState.DEFALT;
    rigidbody: RigidBody2D;
    init(param) {
        this.param = param;
        let { start, direction, angle } = this.param;
        this.node.position =this.position = start;
        this.direction = direction;
        this.node.setRotationFromEuler( 0, 0, angle);
        this.state = BulletState.ENEMY;
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.isStop = false;
        let velocity = v2(this.direction.x * this.speed.x * this.param.popupSpeed,
            this.direction.y * this.speed.y * this.param.popupSpeed);
        this.rigidbody.linearVelocity = velocity;
        this.schedule(this.onUpdate);
    }


    onUpdate(dt: number): void {
        if (this.isStop) return;
        this.outOrder();
    }


    updatePos(dt) {
        this.position = v3(this.position.x + this.direction.x * this.speed.x * dt * this.param.popupSpeed,
            this.position.y + this.direction.y * this.speed.y * dt * this.param.popupSpeed);
        this.node.position = this.position;
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
    public clearBullet(position = null) {
        this.unschedule(this.onUpdate);
        let data=Object.assign({ pos: position, result: this.state }, this.param);
        InsMgr.event.emit(HeroEvent.BULLET,data);
        this.isStop = true;
        this.node.destroy();
    }
}


