import { _decorator, Color, Component, isValid, Node, size, SpringJoint2D, Sprite, UI, UITransform, v3, Vec2 } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
import { enemy } from '../enemy';
const { ccclass, property } = _decorator;
const width = 12;
@ccclass('Laser')
export class Laser extends Component {
    param: any;
    Apk: number = 2000000;
    attTime: number = 0.5;
    initTime: number = 0;
    suddenAttack: number = 1000;
    suddenAttackRate: number = 0.1;
    showTime: number = 5;
    initShowTime: number = 0;
    isReflect: boolean = true;
    reflect: Node = null;

    initreflect: number = 0;
    reflectTime: number = 0.2;

    targetIndex: number = null;
    targetEnemy: Node = null;

    protected onLoad(): void {
        this.initShowTime = 0;
        this.reflect = this.node.getChildByName("reflect");
        this.reflect.active = false;
        this.schedule(this.onUpdate, 0)
    }
    init(param) {
        this.param = param;
        this.node.position = v3(this.param.pos.x + width / 2, this.param.pos.y, 0);

    }
    updateNodeHeight(dt) {
        if (this.targetIndex == null)this.getUpdateEnemy();
        if (this.targetIndex) {
            this.upatePosAngle();
            this.initTime += dt;
            if (this.initTime > this.attTime) {
                this.initTime = 0;
                let target = this.targetEnemy;
                target!.getComponent(enemy)!.dealPhInfo(this.getApkInfo());
                target!.getComponent(enemy)!.changeColor(Color.YELLOW);
               
            }
            if (this.isReflect) {
                this.initreflect += dt;
                if (this.initreflect > this.reflectTime) {
                    this.initreflect = 0;
                    let enemy2 = this.getUpdateStolonEnemy();
                    if (enemy2) {
                        let dis = InsMgr.tool.getDisance(this.param.pos, this.targetEnemy.position);
                        this.addReflect(v3(dis, width), enemy2, this.targetEnemy.position);
                        enemy2!.getComponent(enemy)!.dealPhInfo(this.getApkInfo());
                        enemy2!.getComponent(enemy)!.changeColor(Color.YELLOW);
                    } else{
                        this.reflect.active = false;
                    }
                }else{
                    this.reflect.active = false;
                } 
            }
        } else {
            this.node.getComponent(UITransform).contentSize = size(0, 0)
            this.reflect.active = false;
        }
        this.initShowTime += dt;
        if (this.showTime < this.initShowTime) {
            this.initShowTime = 0;
            this.laserEnd();
        }
    }

    getUpdateEnemy() {
        let list = this.getAllEnemy()
        if (list.length > 0) {
            let item = list[Math.floor(Math.random() * list.length)];
            this.setEnemyInfo(item, item.getComponent(enemy).getIndex());
            return this.targetEnemy;
        } else {
            this.setEnemyInfo();
            return null;
        }
    }

    // 跟新主激光的位置大小及角度
    upatePosAngle() {
        let target = this.targetEnemy;
        if (target) {
            let dis = InsMgr.tool.getDisance(this.param.pos, target.position);
            this.node.getComponent(UITransform).contentSize = size(dis, width)
            const angle = InsMgr.tool.getCalculateDegrees(this.param.pos, v3(target.position.x + width / 2, target.position.y, 0));
            this.node.angle = angle + 180;
        }
    }

    setEnemyInfo(item: Node | null = null, index: number = null) {
        this.targetEnemy = item;
        this.targetIndex = index;
    }

    getCheckIndex(enemyindex: number) {
        if (enemyindex == this.targetIndex) {
            return true;
        }
        return false;
    }

    getUpdateStolonEnemy() {
        if (this.targetIndex == null) return;
        let list = this.getAllEnemy()
        let list_stolon = list.filter(item => this.getCheckIndex(item.getComponent(enemy).getIndex()));
        if (list_stolon.length > 1) {
            let item = list_stolon[Math.floor(Math.random() * list_stolon.length)];
            return item;
        } else {
            return null;
        }
    }

    resetStart(param) {
       
        this.schedule(this.onUpdate, 0)
        this.init(param);
    }

    getAllEnemy() {
        return this.param.buttletmgr.enemyList;
    }

    onUpdate(dt) {
        if (InsMgr.gameinfo.isPause()) return;
        this.updateNodeHeight(dt)
    }

    laserEnd() {
        this.node.getComponent(UITransform).contentSize = size(0, 0)
        this.reflect.active = false;
        this.unschedule(this.onUpdate)
        this.param.cb && this.param.cb()
    }

    getApkInfo() {
        let tempApk = this.suddenAttack * this.Apk;
        let show = Math.random() < this.suddenAttackRate ? true : false;
        return { Apk: this.Apk, AttAPk: tempApk, Show: show }
    }

    // 激光折射
    addReflect(pos1, enemy2, pos3) {
        let pos2 = enemy2.position;
        this.reflect.active = true;
        this.reflect.setPosition(pos1)
        let dis = InsMgr.tool.getDisance(pos3, pos2);
        this.reflect.getComponent(UITransform).contentSize = size(dis, width)
        const angle = InsMgr.tool.getCalculateDegrees(pos2, pos3);
        let rato = 0;
        if (this.node.angle > 0) {
            rato = 90 - this.node.angle;
        } else {
            rato = 90 + this.node.angle;
        }
        rato -= 90
        this.reflect.angle = rato + angle;
    }

}


