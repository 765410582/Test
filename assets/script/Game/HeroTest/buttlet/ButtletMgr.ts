import { _decorator, Component, instantiate, Node, NodePool, UITransform, v3 } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
import { buttlet } from './buttlet';
import { MyObjPool, ObjectPoolMgr } from '../../../frame/ObjectPoolMgr';
const { ccclass, property } = _decorator;

@ccclass('ButtletMgr')
export class ButtletMgr extends Component {

    param: any;
    time: number = 0;
    maxTime: number = 1;
    combo: number =3;// 连击
    volley: number = 2;  //  齐射
    fireTime: number = 1;// 发射子弹时间
    bulletName: string = "bullet";
    bulletList = [];
    isStop: boolean = false;
    constructor(param?) {
        super();
        this.param = param;
        this.schedule(this.onUpdate, this.fireTime);
        ObjectPoolMgr.instance.create(this.bulletName, {
            usageCounter: 0,
            releaseCounter: 0,
            minSize: 5,
            maxSize: 10,
            shrinkThreshold: 0.3
        });
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
        return { start: target, nearest: nearest, order: order }
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
            for (let i = 0; i < this.volley; i++) {
                let index = i % 2;
                let count = Math.ceil(i / 2);
                let offset = index == 1 ? (150 + 150 * count) : -(150 + 150 * count)
                this.addBullet({ start: data.start, nearest: v3(offset + data.nearest.x, offset + data.nearest.y, 0), order: data.order });
            }
        }
    }
    // 添加子弹
    async addBullet(data) {
        let info = { handle: "handleA", prefab: "prefab/buttlet" }
        let item = ObjectPoolMgr.instance.get(this.bulletName);
        if (item) {
            item.getComponent(buttlet).init(Object.assign(data, {
                cb: (bulletNode) => {
                    this.delBullet(bulletNode);
                }
            }));
        } else {
            let prefab: any = await InsMgr.res.getPrefab(info);
            let node = instantiate(prefab);
            node.parent = this.param.test.node;
            let bullet = node.addComponent(buttlet)
            bullet.init(Object.assign(data, {
                cb: (bulletNode) => {
                    this.delBullet(bulletNode);
                }
            }));
            this.bulletList.push(node);
        }
    }

    delBullet(node:Node) {
        this.bulletList = this.bulletList.filter(item => node !== item);
        ObjectPoolMgr.instance.put(this.bulletName, node);
    }

    public onDestroy(): void {
        console.log("销毁 子弹管理");
        ObjectPoolMgr.instance.delete(this.bulletName);
        this.isStop = true;
        this.unschedule(this.onUpdate);
        for (let i = 0; i < this.bulletList.length; i++) {
            let bullet = this.bulletList[i];
            if (bullet) {
                (bullet as Node).destroy();
            }
        }
    }
}


