import { _decorator, Component, EditBox, instantiate, Label, Node, Size, UITransform, v3 } from 'cc';

import { enemy } from './enemy';
import { hero } from './hero';

import { InsMgr } from '../../frame/InsMgr';
import { TimeType } from '../../frame/GameTime';
import { ButtletMgr } from './buttlet/ButtletMgr';
import { hurt, HurtType } from './hurt';
import { ObjectPoolMgr, PoolType } from '../../frame/ObjectPoolMgr';
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
    BULLET = "BULLET",
    HURT = "HURT",
    UDPATEPOOL="UDPATEPOOL"
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
    die: boolean = true;
    curAttTarget: Node = null;
    enemyCount: number = 0;
    enemyMax: number = 0;
    enemyLevel: number = 1;
    buttletMgr: ButtletMgr;
    popupSpeed: number = 1;
    poolInfoArr={};
    
    init(param?) {
        this.param = param;
        InsMgr.gameinfo.startGame();
        ObjectPoolMgr.instance.create(PoolType.DAMAGE)
        ObjectPoolMgr.instance.create(PoolType.BULLET)
        ObjectPoolMgr.instance.create(PoolType.ENEMY)

        this.buttletMgr = new ButtletMgr({ test: this, popupSpeed: this.popupSpeed });
        this.boxSize = this.node.getComponent(UITransform).contentSize
        this.regiterUI();
        this.regiterEvent();
        this.regiterHero();
        this.addBitEnemy();
        this.addTestEditBox();
        this.addPoolInfo();

        
       
    }

    addTestEditBox() {
        let list = ["EditBox_COMBO", "EditBox_VOLLEY", "EditBox_TIME", "EditBox_LASER", "EditBox_SECOND"];
        let list_ch = ["连击", "排枪", "时间", "激光", "次级子弹"];
        for (let i = 0; i < list.length; i++) {
            let path = `layoutlist/${list[i]}`;
            let node = this.node.getChildByPath(path);
            node.getComponent(EditBox).placeholder = list_ch[i];
            node.on("text-changed", (editbox) => {
                let str = editbox.string;
                if (str.length == 0) {
                    return;
                }
                let num = parseInt(str);
                switch (editbox.placeholder) {
                    case "连击":
                        this.buttletMgr.combo = num;
                        break;
                    case "排枪":
                        this.buttletMgr.volley = num;
                        break;
                    case "时间":
                        this.buttletMgr.fireTime = num;
                        break;
                    case "激光":
                        this.buttletMgr.IsLaset = num > 0 ? true : false;
                        break;
                    case "次级子弹":
                        this.buttletMgr.IsSecondBullet = num > 0 ? true : false;
                        break;
                }
            })
        }
    }

    addPoolInfo(){
        let layoutinfo=this.node.getChildByName("layoutinfo")
        let list=[PoolType.ENEMY,PoolType.BULLET,PoolType.DAMAGE]
        for(let i=0;i<list.length;i++){
            let label_pool=layoutinfo.getChildByName(`${list[i]}Label`).getComponent(Label)
            label_pool.string = `${list[i]}_pool:${ObjectPoolMgr.instance.size(list[i])}`
            this.poolInfoArr[list[i]]=label_pool;
        }
    }

    updatePoolInfo(event ,data){
        let {key,count,max_size}=data;
        this.poolInfoArr[key].string = `${key}_pool:${count}---${max_size}`
    }

    regiterUI() {
        this.enemyLabel = this.node.getChildByName("infoLabel").getComponent(Label) as Label;
        InsMgr.tool.reBtnCall(this.node.getChildByName("reBtn"), (state) => {
            if(state){
                InsMgr.gameinfo.startGame();
            }
            
        });
        this.node.getChildByPath("sot/Label").getComponent(Label).string = `x${this.popupSpeed}`
        this.node.getChildByPath("sot").active = this.popupSpeed <= 1 ? false : true;
    }

    regiterEvent() {
        InsMgr.event.on(HeroEvent.ENEMY, this.handlerEventEnemy, this);
        InsMgr.event.on(HeroEvent.DIEENEMY, this.clearEnemy, this);
        InsMgr.event.on(HeroEvent.ATTENEMY, this.attEnemy, this);
        InsMgr.event.on(HeroEvent.HEROEND, this.heroEnd, this);
        InsMgr.event.on(HeroEvent.HURT, this.heroHurt, this);
        InsMgr.event.on(HeroEvent.UDPATEPOOL, this.updatePoolInfo, this);
    }

    addBitEnemy() {
        for (let i = 0; i < 100*this.enemyLevel; i++) {
            InsMgr.time.setTaskTime(TimeType.HeroTouch, {
                time: 0.3 * i,
                event: HeroEvent.ENEMY,
                data: null,
            });
            this.enemyMax++;
        }
        console.log("this.enemyMax",this.enemyMax);
        this.updateEnemyLabel();
        this.enemyLevel++;
    }



    async regiterHero() {
        let info = { handle: "handleA", prefab: "prefab/enemy" }
        let size = this.node.getComponent(UITransform).contentSize;
        let start = v3(0, -size.height / 2 + 200, 0);
        let heroid = "1001"
        let item = structuredClone(GameData.hero[heroid]);
        let bulletid = "4001"
        let buttlet = GameData.bullet[bulletid]

        let prefab: any = await InsMgr.res.getPrefab(info);
        this.hero = instantiate(prefab);
        this.hero.parent = this.node;
        this.hero.addComponent(hero).init(Object.assign(item, { start: start, buttlet: buttlet }));
    }
    async addEnemy() {
        if (InsMgr.gameinfo.isPause()) return;
        let info = { handle: "handleA", prefab: "prefab/enemy" }
        let node = await InsMgr.tool.getDealPool(PoolType.ENEMY, info)
        node.parent = this.node;
        let size = this.node.getComponent(UITransform).contentSize;
        let arr = ["2001", "2002"]
        let id = arr[Math.floor(Math.random() * arr.length)];
        let item = structuredClone(GameData.enemy[id])
        item.ph = item.ph * this.enemyLevel;
        let data = Object.assign(item, { order: size, heroPos: this.hero.position })
        let temp=node.getComponent(enemy)
        if (temp==null){
            temp=node.addComponent(enemy)
        }
        temp.init(data);
        this.enemyList.push(node);
    }

    async addHurt(data) {
        let info = { handle: "handleA", prefab: "prefab/hurt" }
        let node = await InsMgr.tool.getDealPool(PoolType.DAMAGE, info)
        node.parent = this.node;
        node.position = data.pos;
        node.parent = this.node;
        let temp=node.getComponent(hurt)
        if (temp==null){
            temp=node.addComponent(hurt)
        }
        temp.init(data);
    }


    attEnemy(event, data) {
        if (InsMgr.gameinfo.isPause()) return;
        let { node, att } = data;
        this.clearEnemy(event, node);
        this.hero.getComponent(hero).updatePh(att);
    }


    handlerEventEnemy(event, data) {
        if (InsMgr.gameinfo.isPause()) return;
        this.addEnemy();
    }



    heroEnd(event, data) {
        if (!this.die) {
            return;
        }
        InsMgr.gameinfo.pauseGame();
        InsMgr.gameinfo.loseGame();
    }


    heroHurt(event, data) {
        this.addHurt(data)
    }

    updateEnemyLabel() {
        this.enemyLabel.string = "Enemy Die:" + this.dieEnemy + "/" + this.enemyMax;
    }

    clearEnemy(event, data) {
        if (data && data.enemy) {
            this.enemyList = this.enemyList.filter(item => data.enemy !== item)
            if (data.enemy) {
                if (this.curAttTarget == data.enemy) {
                    this.curAttTarget = null;
                }
                ObjectPoolMgr.instance.put(PoolType.ENEMY, data.enemy);
                this.dieEnemy++;
                this.updateEnemyLabel();
                if (this.dieEnemy  == this.enemyMax) {
                    this.scheduleOnce(()=>{
                        this.addBitEnemy()
                    },3);
                }
            }
        }
    }
    protected onDestroy(): void {
        InsMgr.event.off(HeroEvent.ENEMY);
        InsMgr.event.off(HeroEvent.DIEENEMY);
        InsMgr.event.off(HeroEvent.ATTENEMY);
        InsMgr.event.off(HeroEvent.HEROEND);
        InsMgr.event.off(HeroEvent.HURT);
        InsMgr.event.off(HeroEvent.UDPATEPOOL);
        this.buttletMgr.onDestroy();
        this.buttletMgr = null;
        InsMgr.time.claerTaskTime();        
        ObjectPoolMgr.instance.clear();
    }
}


