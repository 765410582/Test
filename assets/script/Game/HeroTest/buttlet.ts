import { _decorator, BoxCollider, BoxCollider2D, Collider, Collider2D, Component, Contact2DType, IPhysics2DContact, ITriggerEvent, Node, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('buttlet')
export class buttlet extends Component {
    private param: any;
    private position: Vec3;
    private speed: Vec2 = v2(1000,1000);
    // 量化方向
    private direction: Vec2;
    private angle;
    Apk: number=10;
    init(param) {
        this.param = param;
        this.position = this.param.start;
        this.direction = this.calculateDirection(this.param.nearest);
        this.calculateAngle(this.param.nearest);
        this.node.angle=this.getAngleInDegrees();
        this.schedule(this.onUpdate);
    }

    // 计算子弹到目标的归一化方向向量
    private calculateDirection(target: Vec3): Vec2 {
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // 归一化向量
        return v2(dx / distance, dy / distance)
    }

    // 计算子弹到目标的旋转角度
    calculateAngle(target: Vec3): void {
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        this.angle = Math.atan2(dy, dx); // 计算弧度
    }

    // 将弧度转换为度数
    getAngleInDegrees(): number {
        return this.angle * (180 / Math.PI);
    }

    onUpdate(dt: number): void {
        this.updatePos(dt);
        this.outOrder();
    }


    updatePos(dt) {
        this.position = v3(this.position.x + this.direction.x * this.speed.x * dt,
            this.position.y + this.direction.y * this.speed.y * dt);
        this.node.position = this.position;
    }

    // 超出边界
    outOrder() {
        if (this.position.x <= -this.param.order.width / 2 ||
            this.position.x >= this.param.order.width / 2 ||
            this.position.y <= -this.param.order.height / 2 ||
            this.position.y >= this.param.order.height / 2) {
            this.node.destroy();
        }
    }
}


