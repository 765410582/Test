import { _decorator, BoxCollider, BoxCollider2D, Collider, Collider2D, Component, Contact2DType, IPhysics2DContact, ITriggerEvent, Node, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('buttlet')
export class buttlet extends Component {
    param: any;
    pos: Vec3;
    maxPos: Vec3;
    speed: number = 15;
    angle: any;
    dir: Vec2;
    Apk: number;
    init(param) {
        this.param = param
        this.pos = this.param.pos;
        this.node.position = this.pos;
        this.angle = this.param.angle;
        this.maxPos = this.param.maxPos;
        this.dir = v2( this.angle==0?0:1/Math.tan(this.angle), 1)
        this.Apk=50;
        this.schedule(this.onUpdate);
    }



    onUpdate(dt: number): void {
        this.pos=v3( this.pos.x + this.speed * this.dir.x,this.pos.y + this.speed * this.dir.y,0);
        this.node.position = this.pos;
        if (this.pos.y > this.maxPos.y) {
            this.node.destroy();
        }
    }
}


