import { _decorator, Component, instantiate, Label, Node,  Size, UITransform, v3 } from 'cc';

import { enemy } from './enemy';
import { hero } from './hero';

import { InsMgr } from '../../frame/InsMgr';
import { UIID } from '../../main/ViewConfig';
import { TimeType } from '../../frame/GameTime';
import { ButtletMgr } from './buttlet/ButtletMgr';
const { ccclass, property } = _decorator;
const GameData = {
    hero: {
        "1001": {
            id: "1001",
            ph: 100,
            time: 1,
            att: 100,

            att_type: "",
            des: "普通英雄"
        }
    },
    enemy: {
        "2001": {
            id: "2001",
            ph: 50,
            time: 3,
            speed: 50,
            att: 100,
            distance: 300
        },
        "2002": {
            id: "2002",
            ph: 70,
            time: 1.5,
            speed: 30,
            att: 10,
            distance: 150
        }
    },

    bullet: {
        "4001": {
            id: "4001",
            level: 1,
            att: 10,
            spacing: 600,
            distance: 350
        },
        "4002": {
            id: "4002",
            level: 2,
            att: 20,
            spacing: 400,
            distance: 150
        }
    }
    ,
    jewel: [
        {
            id: "3001",
        }
    ]

}
export enum HeroEvent {
    ENEMY = "ENEMY",
    DIEENEMY = "DIEENEMY",
    ATTENEMY = "ATTENEMY",
    HEROEND = "HEROEND",
    BULLET="BULLET",
    
}


@ccclass('HeroTestMgr')
export class HeroTestMgr extends Component {
    param = null;
    enemyList: Node[] = [];
    hero: Node;
    boxSize: Size;

    enemyLabel: Label;
    dieEnemy: number = 0;
    buttletLevel: number = 1;
    _pause: boolean = true;
    die: boolean = true;
    curAttTarget:Node=null;
    enemyCount: number = 0;
    enemyMax: number = 0;
    enemyLevel: number = 1;
    buttletMgr: ButtletMgr;
    popupSpeed:number=1;
    get isPause() {
        return this._pause;
    }
    set isPause(value) {
        this._pause = value;
        this.updateEnemy(this._pause)
    }
    init(param?) {
        this.param = param;

        this.buttletMgr=new ButtletMgr({test:this,popupSpeed:this.popupSpeed});
        this.boxSize = this.node.getComponent(UITransform).contentSize
        this.regiterUI();
        this.regiterEvent();
        this.regiterHero();
        this.addBitEnemy();
    }

    regiterUI() {
        this.enemyLabel = this.node.getChildByName("infoLabel").getComponent(Label) as Label;
        InsMgr.tool.reBtnCall(this.node.getChildByName("reBtn"), (state) => {
            this.isPause = state;
        });
        this.node.getChildByPath("sot/Label").getComponent(Label).string=`x${this.popupSpeed}`
        this.node.getChildByPath("sot").active=this.popupSpeed<=1?false:true;
    }

    regiterEvent() {
        InsMgr.event.on(HeroEvent.ENEMY, this.handlerEventEnemy, this);
        InsMgr.event.on(HeroEvent.DIEENEMY, this.clearEnemy, this);
        InsMgr.event.on(HeroEvent.ATTENEMY, this.attEnemy, this);
        InsMgr.event.on(HeroEvent.HEROEND, this.heroEnd, this);
    }

    addBitEnemy(){
        this.enemyLevel++;
        for(let i=0;i<100;i++){
            InsMgr.time.setTaskTime(TimeType.HeroTouch,{
                time:0.3*i,
                event:HeroEvent.ENEMY,
                data:null,
            });
            this.enemyMax++;
        }
        this.updateEnemyLabel();
    }

    

    async regiterHero() {
        let info = { handle: "handleA", prefab: "prefab/enemy"}
        let prefab: any = await InsMgr.res.getPrefab(info);
        this.hero = instantiate(prefab);
        this.hero.parent = this.node;
        let size = this.node.getComponent(UITransform).contentSize;
        let start = v3(0, -size.height / 2 + 200, 0);
        let heroid = "1001"
        let item = structuredClone(GameData.hero[heroid]);
        let bulletid = "4001"
        let buttlet = GameData.bullet[bulletid]
        this.hero.addComponent(hero).init(Object.assign(item, { start: start, buttlet: buttlet }));
    }
    async addEnemy() {
        if (!this.isPause) return;
        let info = { handle: "handleA", prefab: "prefab/enemy" }
        let prefab: any = await InsMgr.res.getPrefab(info);
        let node = instantiate(prefab);
        node.parent = this.node;
        let size = this.node.getComponent(UITransform).contentSize;
        let arr = ["2001", "2002"]
        let id = arr[Math.floor(Math.random() * arr.length)];
        let item = structuredClone(GameData.enemy[id])
        item.ph=item.ph*this.enemyLevel;
        let data = Object.assign(item, { order: size, heroPos: this.hero.position })
        node.addComponent(enemy).init(data);
        this.enemyList.push(node);
    }



    attEnemy(event, data) {
        if (!this.isPause) return;
        let { node, att } = data;
        this.clearEnemy(event, node);
        this.hero.getComponent(hero).updatePh(att);
    }


    handlerEventEnemy(event, data) {
        if (!this.isPause) return;
        this.addEnemy();
    }

   

    heroEnd(event, data) {
        if (!this.die) {
            return;
        }
        this.die = false;
        this.isPause = false;
        this.buttletMgr.isStop=true;
        let tdata={
            title:"SHOOT OVER",
            isConfire:true,
            isCancel:true,
            confireCb:()=>{
                InsMgr.tool.layerEnd()
            },
            cancelCb:()=>{
                InsMgr.tool.layerEnd()
            },
            text:"Shooting finished, mission complete",
        }
        InsMgr.layer.show(UIID.GameOver,tdata);
    }

    updateEnemy(state) {
        for (let i = 0; i < this.enemyList.length; i++) {
            let tenemy = this.enemyList[i].getComponent(enemy);
            tenemy.isPause = state;
        }
    }

    updateEnemyLabel() {
        this.enemyLabel.string = "Enemy Die:" + this.dieEnemy+"/"+this.enemyMax;
    }

    clearEnemy(event, data) {
        if(data&&data.enemy){
            this.enemyList = this.enemyList.filter(item => data.enemy !== item)
            if (data.enemy) {
                if(this.curAttTarget==data.enemy){
                    this.curAttTarget=null;
                }
                data.enemy.destroy();
                this.dieEnemy++;
                this.updateEnemyLabel();
                if(this.dieEnemy%100==0){
                    this.addBitEnemy()
                }
            }
        }
    }
    protected onDestroy(): void {
        InsMgr.event.off(HeroEvent.ENEMY);
        InsMgr.event.off(HeroEvent.DIEENEMY);
        InsMgr.event.off(HeroEvent.ATTENEMY);
        InsMgr.event.off(HeroEvent.HEROEND);
        this.buttletMgr.onDestroy();
        this.buttletMgr=null;

    }
}


