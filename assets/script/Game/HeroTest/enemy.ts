import { _decorator, BoxCollider2D, Collider2D, Color, Component, Contact2DType, IPhysics2DContact,RigidBody2D,SpringJoint2D,Sprite,v3, Vec3 } from 'cc';


import { InsMgr } from '../../frame/InsMgr';
import { HeroEvent } from './HeroTestMgr';
import { buttlet } from './buttlet/buttlet';
import { Laser } from './att/Laser';
const { ccclass, property } = _decorator;
@ccclass('enemy')
export class enemy extends Component {

    private param: any;
    private pos: Vec3;

    private running: boolean = false;
    private attTime:number=0;
    private _pause:boolean=true;
    private attTimer:number=0;
    private attMaxTime:number=0.5;
    private attOpen:boolean=false;
    private sprite:Sprite;
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
        this.sprite=this.node.getChildByName("Sprite").getComponent(Sprite);
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
            bullet.clearBullet(this.pos);
           this.updatePh(bullet.Apk);
            this.attOpen=true;
            this.sprite.color=Color.RED;
            this.attTimer=0;
        }
    }

    updatePh(ph){
        this.param.ph -=ph;
        if (this.param.ph <= 0) {
            InsMgr.event.emit(HeroEvent.DIEENEMY, {enemy:this.node});
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
            this.pos  = v3(this.pos.x,this.pos.y-dt * this.param.speed,this.pos.z);
            this.node.position = this.pos ;
            let tempPos=this.pos.y-this.param.distance;
            if ( tempPos< this.param.heroPos.y) {
                this.running=true;
            }
        }
        if(this.attOpen){
            this.attRed(dt);
        }
     
    }

    // 打到敌人
    attRed(dt){
        this.attTimer+=dt
        if(this.attMaxTime<this.attTimer){
            this.attOpen=false;
            this.sprite.color=Color.WHITE;
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


