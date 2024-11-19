import { _decorator, Component, instantiate, Node, NodePool, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
import { BulletState, buttlet } from './buttlet';
import { ObjectPoolMgr } from '../../../frame/ObjectPoolMgr';
import { HeroEvent } from '../HeroTestMgr';
import { Laser } from '../att/Laser';
const { ccclass, property } = _decorator;

// 子弹类型
export enum BulletType {
    BULLET_MAIN = "BULLET_MAIN",//主子弹
    BULLET_SECOND = "BULLET_SECOND",//次级子弹
    BULLET_DEL = "BULLET_DEL"//子弹消除
}

export const BulletPoolPath: string = "bullet";
@ccclass('ButtletMgr')
export class ButtletMgr extends Component {

    param: any;
    time: number = 0;
    maxTime: number = 1;
    combo: number = 5;// 连击
    volley: number = 2;  //  齐射
    fireTime: number = 1;// 发射子弹时间
    IsSecondBullet: boolean = true;//次级子弹
    IsWallReflect: boolean = true;
    IsFourBullet: boolean = true;
    bulletList = [];
    isStop: boolean = false;
    laset: Laser;
    IsLaset: boolean = true;
    constructor(param?) {
        super();
        this.param = param;
        this.schedule(this.onUpdate, this.fireTime);
        ObjectPoolMgr.instance.create(BulletPoolPath, {
            usageCounter: 0,
            releaseCounter: 0,
            minSize: 5,
            maxSize: 10,
            shrinkThreshold: 0.3
        });

        InsMgr.event.on(HeroEvent.BULLET, this.bulletRemove, this);
       
    }
    onUpdate(deltaTime: number) {
        if (this.isStop) {
            return;
        }
        this.time += deltaTime;
        if (this.maxTime < this.time) {
            this.time = 0;
            let data = this.getCheckEnemy();
            if (data) {
                this.bulletCombo(data);
            }
        }
        if (this.IsLaset) {
            this.addLaser();
        }
        

    }
    //检查敌人位置
    getCheckEnemy() {
        let nearest = null;
        let target = this.param.test.hero.position;
        if (this.param.test.curAttTarget) {
            nearest = this.param.test.curAttTarget.position;
        } else {
            let len = this.param.test.enemyList.length;
            if (len <= 0) { return null; }
            nearest = this.param.test.enemyList[0].position;
            this.param.test.curAttTarget = this.param.test.enemyList[0];
            let minDistance = nearest.y - target.y;
            this.param.test.enemyList.forEach(item => {
                let coordinate = item.position
                const distance = coordinate.y - target.y;
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = coordinate;
                    this.param.test.curAttTarget = item;
                }
            })
        }
        let order = this.param.test.node.getComponent(UITransform).contentSize;
        const direction = InsMgr.tool.getCalculateDirection(nearest, target)
        const angle = InsMgr.tool.getCalculateDegrees(nearest, target);
        return {
            start: target, direction: direction, angle: angle
            , order: order, popupSpeed: this.param.popupSpeed, type: BulletType.BULLET_MAIN
        }
    }

    //获取所有敌人
    getAllEnemy() {
        let enemyList = [];
        this.param.test.enemyList.forEach(item => {
            enemyList.push(item);
        })
        return enemyList;
    }

    // 连击
    bulletCombo(data) {
        if (this.combo > 0) {
            this.schedule(() => {
                if (this.isStop) {
                    return;
                }
                this.bulletVolley(data)
            }, 0.1, this.combo, 0);
        } else {
            this.bulletVolley(data)
        }
    }
    // 齐射个数
    bulletVolley(data) {
        this.addBullet(data);
        if (this.volley > 0) {
            const { start, angle, order } = data;
            let upCount = 0;
            let downCount = 0;
            let moveAngle = 5;
            for (let i = 1; i <= this.volley; i++) {
                let mode = i % 2
                let curAngle = null;
                if (mode == 0) {
                    upCount++;
                    curAngle = angle - upCount * moveAngle;
                } else {
                    downCount++;
                    curAngle = angle + downCount * moveAngle;
                }
                let degress = InsMgr.tool.getDegreesInAngle(curAngle);
                let curNearest = InsMgr.tool.getTargetPos(degress, start);
                const curDirection = InsMgr.tool.getCalculateDirection(curNearest, start)
                const curdata = {
                    start: start, direction: curDirection, angle: curAngle
                    , order: order, popupSpeed: this.param.popupSpeed, type: BulletType.BULLET_MAIN
                }

                this.addBullet(curdata);
            }
        }
    }


    // 添加子弹
    async addBullet(data) {
        let node = ObjectPoolMgr.instance.get(BulletPoolPath);
        if (node) {
            node.parent = this.param.test.node;
            let bullet = node.getComponent(buttlet)
            bullet.init(data);
        } else {
            let info = { handle: "handleA", prefab: "prefab/buttlet" }
            let prefab: any = await InsMgr.res.getPrefab(info);
            node = instantiate(prefab);
            node.parent = this.param.test.node;
            let bullet = node.addComponent(buttlet)
            bullet.init(data);
        }
        this.bulletList.push(node);
    }

    // 激光
    public async addLaser() {
        let data = this.getAllEnemy();
        if (data.length <= 0) {
            console.log("没有敌人？,等待");
            this.IsLaset=true;
            return;
        }
        this.IsLaset=false;
        let target = data[Math.floor(Math.random() * data.length)] as Node;
        let pos = v3(this.param.test.hero.position);

        let tdata = { target: target, pos: v3(pos.x + 26 / 2, pos.y, 0) ,cb:()=>{
            this.addLaser();
        }}
        if (this.laset) {
            this.laset.init(tdata);
            return;
        }
        let info = { handle: "handleA", prefab: "prefab/laser" }
        let prefab: any = await InsMgr.res.getPrefab(info);
        let node = instantiate(prefab);
        node.parent = this.param.test.node;
        this.laset = node.addComponent(Laser) as Laser;
        this.laset.init(tdata);
        node.getComponent(UITransform).priority = 10
    }
    
    //  处理子弹
    bulletRemove(event, data) {
        let { node, type, result } = data;
        const index = this.bulletList.indexOf(node);
        if (index !== -1) {
            this.bulletList.splice(index, 1);
        }

        // 如果是主子弹
        if (type == BulletType.BULLET_MAIN) {
            switch (result) {
                case BulletState.ENEMY:// 碰到怪物
                    // 发射两个次级子弹
                    if (this.IsSecondBullet) {
                        this.addSecondBullet(data);
                    }
                    // 四方攻击
                    if (this.IsFourBullet) {
                        this.addFourBullet(data);
                    }
                    break;
                case BulletState.WALL:
                    // 碰到墙壁
                    if (this.IsWallReflect)
                        this.addWallReflect(data);
                    break;
                default:
                    throw new Error("没有处理子弹类型");
            }
        }
    }
    addFourBullet(data: any) {
        let { pos, order } = data;
        if (!pos) return;
        let tpos = [v2(50, 0), v2(0, 50), v2(-50, 0), v2(0, -50)]
        let angel = 90;
        for (let i = 0; i < 4; i++) {
            let curAngle = angel * i;
            let start = v3(pos.x + tpos[i].x, pos.y + tpos[i].y, 0)
            let degress = InsMgr.tool.getDegreesInAngle(curAngle);
            let curNearest = InsMgr.tool.getTargetPos(degress, start);
            const curDirection = InsMgr.tool.getCalculateDirection(curNearest, start)
            const curdata = {
                start: start, direction: curDirection, angle: curAngle
                , order: order, popupSpeed: this.param.popupSpeed, type: BulletType.BULLET_SECOND
            }
            this.addBullet(curdata);
        }
    }

    // 次级子弹发射
    public addSecondBullet(data) {
        let { pos, order } = data;
        if (!pos) return;
        let start = v3(pos.x, pos.y + 50, 0)
        let angel = 15;
        for (let i = 1; i <= 2; i++) {
            let curAngle = 90 + (i % 2 == 0 ? angel : -angel);
            let degress = InsMgr.tool.getDegreesInAngle(curAngle);
            let curNearest = InsMgr.tool.getTargetPos(degress, start);
            const curDirection = InsMgr.tool.getCalculateDirection(curNearest, start)
            const curdata = {
                start: start, direction: curDirection, angle: curAngle
                , order: order, popupSpeed: this.param.popupSpeed, type: BulletType.BULLET_SECOND
            }
            this.addBullet(curdata);
        }
    }

    // 墙壁反射
    public addWallReflect(data) {
        let { pos, order, angle } = data;
        let start = v3(pos.x, pos.y + 50, 0)
        let curAngle = 180 - angle;
        let degress = InsMgr.tool.getDegreesInAngle(curAngle);
        let curNearest = InsMgr.tool.getTargetPos(degress, start);
        const curDirection = InsMgr.tool.getCalculateDirection(curNearest, start)
        const curdata = {
            start: start, direction: curDirection, angle: curAngle
            , order: order, popupSpeed: this.param.popupSpeed, type: BulletType.BULLET_SECOND
        }
        this.addBullet(curdata);
    }



    public onDestroy(): void {
        InsMgr.event.off(HeroEvent.BULLET);
        ObjectPoolMgr.instance.delete(BulletPoolPath);
        this.isStop = true;
        this.unschedule(this.onUpdate);
        for (let i = 0; i < this.bulletList.length; i++) {
            let bullet = this.bulletList[i];
            if (bullet) {
                (bullet as Node).removeFromParent();
            }
        }
    }
}


