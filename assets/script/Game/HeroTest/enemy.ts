import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact,RigidBody2D,v3, Vec3 } from 'cc';


import { InsMgr } from '../../frame/InsMgr';
import { HeroEvent } from './HeroTestMgr';
import { buttlet } from './buttlet/buttlet';
const { ccclass, property } = _decorator;
@ccclass('enemy')
export class enemy extends Component {

    private param: any;
    private pos: Vec3;

    private running: boolean = false;
    private attTime:number=0;
    private _pause:boolean=true;
    get isPause() {
        return this._pause;
    }
    set isPause(value) {
        this._pause = value;
    }
    init(param) {
        this.param = param;
        this.pos = this.getStartPos();
        this.node.position = this.pos;
        let collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.schedule(this.onUpdate)
    }
    /**
* 当碰撞结束后调用
* @param  {Collider} other 产生碰撞的另一个碰撞组件
* @param  {Collider} self  产生碰撞的自身的碰撞组件
*/
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let otherNode=otherCollider.node
        if (otherNode.name == "buttlet") {
            let bullet=otherNode.getComponent(buttlet)
            bullet.clearBullet();
            this.param.ph -= bullet.Apk;
            if (this.param.ph <= 0) {
                InsMgr.event.emit(HeroEvent.DIEENEMY, {enemy:selfCollider.node});
            }
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
        if(!this.isPause)return;
        if(this.running){
            this.attTime+=dt;
            if(this.attTime>=this.param.time){
                this.attTime=0;
                InsMgr.event.emit(HeroEvent.ATTENEMY, this.param);
            }
        }else{
            this.pos  = this.pos.subtract(v3(0, dt * this.param.speed, 0));
            this.node.position =   this.pos ;
            let tempPos=this.pos.y-this.param.distance;
            if ( tempPos< this.param.heroPos.y) {
                this.running=true;
            }
        }
    }

    protected onDestroy(): void {
        let collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.unschedule(this.onUpdate);
    }

  
}


