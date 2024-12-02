import { _decorator, Color, Component, isValid, Node, size, SpringJoint2D, Sprite, UI, UITransform, v3, Vec2 } from 'cc';
import { InsMgr } from '../../../frame/InsMgr';
import { enemy } from '../enemy';
import { HurtType } from '../hurt';
const { ccclass, property } = _decorator;
const width = 12;
@ccclass('Laser')
export class Laser extends Component {
    param: any;
    Apk: number = 200;
    isEnemyDie: boolean = false;
    attTime: number =0.2;
    initTime: number = 0;
    suddenAttack: number=50;
    suddenAttackRate: number=0.5;
    showTime: number = 5;
    initShowTime: number = 0;
    protected onLoad(): void {
        this.node.getComponent(UITransform).priority = 1;
        this.initShowTime=0;
    }
    init(param) {   
        this.param = param;
        this.node.position = v3(this.param.pos.x+width/2,this.param.pos.y,0);
        if (!this.isEnemyDie) {
            this.schedule(this.onUpdate, 0.1)
        }
        this.isEnemyDie = true;
    }
    updateNodeHeight(dt) {
        let { pos, target } = this.param;
        if(!isValid(target)){
            this.param.target=target=this.getAllEnemy()[0];
        }
        if (isValid(target)) {
            let dis = InsMgr.tool.getDisance(pos, target.position);
            this.node.getComponent(UITransform).contentSize = size(dis, width)
            target.getChildByName("Sprite").getComponent(Sprite).color = Color.YELLOW;
            const angle = InsMgr.tool.getCalculateDegrees(pos, v3(target.position.x + width/2, target.position.y, 0));
            this.node.angle = angle + 180;
            this.initTime += dt;
            if (this.initTime > this.attTime) {
                this.initTime = 0;
                target.getComponent(enemy).dealPhInfo(this.getApkInfo());
            }
        }

        this.initShowTime += dt;
        if(this.showTime<this.initShowTime){
            this.laserEnd();
        }
    }


    resetStart(param){
        this.initShowTime=0;
        this.init(param);
    }

    getAllEnemy(){
        return this.param.buttletmgr.getAllEnemy();
    }

    onUpdate(dt) {
        if (!this.isEnemyDie) return;
        this.updateNodeHeight(dt)
    }

    laserEnd() {
        this.isEnemyDie = false;
        this.node.getComponent(UITransform).contentSize = size(0, 0)
        this.unschedule(this.onUpdate)
        if (typeof this.param.cb === "function") {
            this.param.cb();
        }
    }

    getApkInfo(){
        let tempApk=this.suddenAttack*this.Apk;
        let show=Math.random()<this.suddenAttackRate?true:false;
        return {Apk:this.Apk,AttAPk:tempApk,Show:show}
    }


}


