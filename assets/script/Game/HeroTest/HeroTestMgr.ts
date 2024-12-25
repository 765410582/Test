import { _decorator, Component, EditBox, instantiate, Label, Node, Sprite, UITransform, v3 } from 'cc';

import { enemy } from './enemy';
import { hero } from './hero';

import { InsMgr } from '../../frame/InsMgr';
import { TimeType } from '../../frame/GameTime';
import { ButtletMgr } from './buttlet/ButtletMgr';
import { hurt } from './hurt';
import { ObjectPoolMgr, PoolType } from '../../frame/ObjectPoolMgr';
import { Laser } from './att/Laser';
import { BaseUI } from '../../frame/ui/BaseUI';
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
            att: 1000,
            spacing: 600,
            distance: 350
        },
        "4002": {
            id: "4002",
            level: 2,
            att: 20000,
            spacing: 400,
            distance: 150
        }
    }
    ,
    skill: {
        "3001": {
            id: "3001",
            name: "激光",
            des: "",
            time: 5,
            apk: 100,
            lv: 1,
            count: 1,
            property: null,

        },
    }

}
export enum HeroEvent {
    ENEMY = "ENEMY",
    DIEENEMY = "DIEENEMY",
    ATTENEMY = "ATTENEMY",
    HEROEND = "HEROEND",
    BULLET = "BULLET",
    HURT = "HURT",
    UDPATEPOOL = "UDPATEPOOL"
}
@ccclass('HeroTestMgr')
export class HeroTestMgr extends BaseUI {
    

    enemyList: Node[] = [];
    hero: Node;
    dieEnemy: number = 0;
    enemyMax: number = 0;
    enemyLevel: number = 1;
    buttletMgr: ButtletMgr;
    popupSpeed: number = 1.5;
    poolInfoArr = {};
    buttletEffect = [];
    showEfect = [];
    laset: any;

    onRegisterUI(): void {
        InsMgr.tool.reBtnCall(this.getNode("reBtn"), (state) => {
            if (state) {
                InsMgr.gameinfo.startGame();
            }
        });
        this.getNode("sot/Label", null, Label).string = `x${this.popupSpeed}`
        this.getNode("sot").active = this.popupSpeed <= 1 ? false : true;
        let children = this.getNode("layoutlist").children;
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            let icon = this.getNode("icon", child);
            icon.active = false;
            let sprite = this.getNode("bar", child, Sprite);
            sprite.node.active = false;
            let label = this.getNode("Label", child, Label);
            label.node.active = false;
            sprite.fillRange = 1;
            this.buttletEffect.push({ icon: icon, bar: sprite, label: label });
        }
    }
    onRegisterEvent(): void {
        ObjectPoolMgr.instance.create(PoolType.DAMAGE)
        ObjectPoolMgr.instance.create(PoolType.BULLET)
        ObjectPoolMgr.instance.create(PoolType.ENEMY)

        InsMgr.event.on(HeroEvent.ENEMY, this.handlerEventEnemy, this);
        InsMgr.event.on(HeroEvent.DIEENEMY, this.clearEnemy, this);
        InsMgr.event.on(HeroEvent.ATTENEMY, this.attEnemy, this);
        InsMgr.event.on(HeroEvent.HEROEND, this.heroEnd, this);
        InsMgr.event.on(HeroEvent.HURT, this.heroHurt, this);
        InsMgr.event.on(HeroEvent.UDPATEPOOL, this.updatePoolInfo, this);
    }

    onStart() {
        InsMgr.gameinfo.startGame();
        this.buttletMgr = new ButtletMgr({ test: this, popupSpeed: this.popupSpeed });
        this.regiterHero();
        this.addBitEnemy();
        this.addPoolInfo();
    }



    addShowEffect(data) {
        let index = this.showEfect.length;
        let effect = this.buttletEffect[index]
        effect.icon.active = true;
        effect.label.node.active = true;
        this.showEfect.push(data);
        if (this.showEfect.length == 1) {
            this.schedule(this.onUpdate, 0.1);
        }
    }

    addPoolInfo() {
        let layoutinfo = this.getNode("layoutinfo");
        let list = [PoolType.ENEMY, PoolType.BULLET, PoolType.DAMAGE]
        for (let i = 0; i < list.length; i++) {
            let label_pool = this.getNode(`${list[i]}Label`, layoutinfo, Label)
            label_pool.string = `${list[i]}_pool:${ObjectPoolMgr.instance.size(list[i])}`
            this.poolInfoArr[list[i]] = label_pool;
        }
    }

    updatePoolInfo(event, data) {
        let { key, count, max_size } = data;
        this.poolInfoArr[key].string = `${key}_pool:${count}---${max_size}`
    }



    addBitEnemy() {
        for (let i = 0; i < 100 * this.enemyLevel; i++) {
            InsMgr.time.setTaskTime(TimeType.HeroTouch, {
                time: 0.3 * i,
                event: HeroEvent.ENEMY,
                data: null,
            });
            this.enemyMax++;
        }
        this.updateEnemyLabel();
        this.enemyLevel++;
    }



    async regiterHero() {
        let info = { handle: "handleA", prefab: "prefab/enemy" }

        let start = v3(0, -this.size.height / 2 + 200, 0);
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

        let arr = ["2001", "2002"]
        let id = arr[Math.floor(Math.random() * arr.length)];
        let item = structuredClone(GameData.enemy[id])
        item.ph = item.ph * this.enemyLevel;
        let data = Object.assign(item, { order: this.size, heroPos: this.hero.position, index: this.enemyList.length })

        let node = await InsMgr.tool.getDealPool(PoolType.ENEMY, info)
        node.parent = this.node;
        let temp = node.getComponent(enemy)
        if (temp == null) {
            temp = node.addComponent(enemy)
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
        let temp = node.getComponent(hurt)
        if (temp == null) {
            temp = node.addComponent(hurt)
        }
        temp.init(data);
    }


    // 激光
    public async addLaser(id: string, index: number) {
        let data = this.enemyList;
        if (data.length <= 0) {
            return;
        }
        this.showEfect[index].open = false;
        let target = data[Math.floor(Math.random() * data.length)] as Node;
        let pos = v3(this.hero.position);
        let tdata = {
            target: target, pos: pos, buttletmgr: this, id: id, cb: () => {
                this.showEfect[index].state = 0;
                this.showEfect[index].open = true;
            }
        }
        if (this.laset) {
            this.laset.resetStart(tdata);
            return;
        }
        let info = { handle: "handleA", prefab: "prefab/laser" }
        let prefab: any = await InsMgr.res.getPrefab(info);
        let node = instantiate(prefab);
        node.parent = this.node;
        this.laset = node.addComponent(Laser) as Laser;
        this.laset.init(tdata);

        node.getComponent(UITransform).priority = 1;

        this.showEfect[index].obj = this.laset;
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
        if (InsMgr.gameinfo.isPause()) return;
        InsMgr.gameinfo.pauseGame();
        InsMgr.gameinfo.loseGame();
    }


    heroHurt(event, data) {
        this.addHurt(data)
    }

    updateEnemyLabel() {
        this.node.getChildByName("infoLabel").getComponent(Label).string = "Enemy Die:" + this.dieEnemy + "/" + this.enemyMax;
    }

    clearEnemy(event, data) {

        if (data && data.enemy) {
            let { enemy: enemy1 } = data;
            if (enemy1.getComponent(enemy)) {
                let index = enemy1.getComponent(enemy).getIndex()
                if (this.buttletMgr.getCheckIndex(index)) {
                    this.buttletMgr.setEnemyInfo();
                }
                if (this.laset && this.laset.getCheckIndex(index)) {
                    this.laset.setEnemyInfo()
                }
            }
            this.enemyList = this.enemyList.filter(item => enemy1 !== item)
            if (enemy1) {
                ObjectPoolMgr.instance.put(PoolType.ENEMY, enemy1);
                this.dieEnemy++;
                this.updateEnemyLabel();
                if (this.dieEnemy == this.enemyMax) {
                    this.scheduleOnce(() => {
                        this.addBitEnemy()
                    }, 3);

                    // 添加新的属性 或者 类型
                    if (!this.laset) {
                        let data = { id: "3001", open: true, state: 0, time: 0, func: "addLaser", obj: null }
                        this.addShowEffect(data);
                    }
                }
            }
        }
    }

    onUpdate(dt) {
        if (InsMgr.gameinfo.isPause()) return;
        for (let i = 0; i < this.showEfect.length; i++) {
            let item = this.showEfect[i];
            if (!item.open) continue;
            if (item.state == 0) {
                item.time += dt;
                let skillData = GameData.skill[item.id];
                let sprite_bar = this.buttletEffect[i].bar as Sprite
                sprite_bar.node.active = true;
                sprite_bar.fillRange = 1 - item.time / skillData.time;
                if (skillData) {
                    if (skillData.time <= item.time) {
                        item.state = 1;
                        item.time = 0;
                        sprite_bar.fillRange = 1;
                        sprite_bar.node.active = false;
                    }
                }
            }
            if (item.open && item.state) {
                if (typeof this[item.func] == "function") {
                    this[item.func](item.id, i);
                }
            }
        }
    }

    unRegister() {
        this.buttletMgr.onDestroy();
        this.buttletMgr = null;
        InsMgr.time.claerTaskTime();
        this.unschedule(this.onUpdate);
    }
}


