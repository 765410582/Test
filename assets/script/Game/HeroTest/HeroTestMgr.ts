import { _decorator, assetManager, Component, instantiate, Label, Node, Prefab, Size, UITransform, v3, Vec2, Vec3 } from 'cc';

import { enemy } from './enemy';
import { hero } from './hero';
import { buttlet } from './buttlet';
import { InsMgr } from '../../frame/InsMgr';
import { UIID } from '../../main/ViewConfig';
import { time } from 'console';
import { NextLayer } from '../../frame/LayerManager';
import { EventType } from '../../TestMain';
import { stat } from 'fs';


const { ccclass, property } = _decorator;

const GameData = {
    hero: {
        "1001": {
            id: "1001",
            ph: 100,
            time: 1,
            att: 10,

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
            att: 10,
            distance: 300
        },
        "2002": {
            id: "2002",
            ph: 50,
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
    BUTTLET = "BUTTLET",
    DIEENEMY = "DIEENEMY",
    ATTENEMY = "ATTENEMY",
    HEROEND = "HEROEND"
}
@ccclass('HeroTestMgr')
export class HeroTestMgr extends Component {
    param = null;
    enemyList: Node[] = [];
    hero: Node;
    buttletList: Node[] = [];
    boxSize: Size;

    enemyLabel: Label;
    dieEnemy: number = 0;
    buttletLevel: number = 1;
    _pause: boolean = true;
    die: boolean = true;
    get isPause() {
        return this._pause;
    }
    set isPause(value) {
        this._pause = value;
        this.updateEnemy(this._pause)
    }
    init(param?) {
        this.param = param;
        this.boxSize = this.node.getComponent(UITransform).contentSize
        this.regiterUI();
        this.regiterEvent();
        this.regiterHero();
        this.schedule(this.onUpdate, 1);
    }

    regiterUI() {
        this.enemyLabel = this.node.getChildByName("infoLabel").getComponent(Label) as Label;
        InsMgr.tool.reBtnCall(this.node.getChildByName("reBtn"), (state) => {
            this.isPause = state;
        });
    }

    regiterEvent() {
        InsMgr.event.on(HeroEvent.BUTTLET, this.handlerEventButtlet, this);
        InsMgr.event.on(HeroEvent.DIEENEMY, this.clearEnemy, this);
        InsMgr.event.on(HeroEvent.ATTENEMY, this.attEnemy, this);
        InsMgr.event.on(HeroEvent.HEROEND, this.heroEnd, this);
    }

    enemyCount: number = 0;
    enemyMax: number = 100;
    onUpdate(deltaTime: number) {
        //浏览器兼容差
        requestIdleCallback(dealline => {
            if (dealline.timeRemaining() > 0.1) {
                this.enemyCount++;
                if (this.enemyCount < this.enemyMax) {
                    this.addEnemy();
                } else {
                    console.log("下一个循环开始");
                }
            }
        });
    }


    async regiterHero() {
        let info = { handle: "handleA", prefab: "prefab/enemy" }
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

    async addButtlet1(data) {
        let info = { handle: "handleA", prefab: "prefab/buttlet" }
        let prefab: any = await InsMgr.res.getPrefab(info);
        let node = instantiate(prefab);
        node.parent = this.node;
        node.addComponent(buttlet).init(data);
    }

    handlerEventButtlet(event, data) {
        if (!this.isPause) return;
        let len = this.enemyList.length;
        if (len <= 0) { return; }
        let target = this.hero.position;
        let nearest = this.enemyList[0].position;
        let minDistance = InsMgr.tool.getDisance(nearest, target);
        this.enemyList.forEach(item => {
            let coordinate = item.position
            const distance = InsMgr.tool.getDisance(coordinate, target);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = coordinate;
            }
        })
        let size = this.node.getComponent(UITransform).contentSize;
        this.addButtlet1({ start: target, nearest: nearest, order: size });
    }

    heroEnd(event, data) {

        if (!this.die) {
            return;
        }
        this.die = false;
        this.isPause = false;
        InsMgr.layer.show(UIID.GameOver, Object.assign(data, {
            UIID: UIID.HeroTest, cb: (state) => {
                this.isPause = state;
                if (state) {
                    InsMgr.tool.layerEnd()
                }

            }
        }));
    }

    updateEnemy(state) {
        for (let i = 0; i < this.enemyList.length; i++) {
            let tenemy = this.enemyList[i].getComponent(enemy);
            tenemy.isPause = state;
        }
    }
    
    updateEnemyLabel() {
        this.enemyLabel.string = "Enemy Die:" + this.dieEnemy;
    }

    clearEnemy(event, data) {
        let len = this.enemyList.length;
        this.enemyList = this.enemyList.filter(item => data !== item)
        len = this.enemyList.length;
        if (data) {
            data.destroy();
            this.dieEnemy++;
            this.updateEnemyLabel();
        }
    }
    protected onDestroy(): void {
        InsMgr.event.off(HeroEvent.BUTTLET);
        InsMgr.event.off(HeroEvent.DIEENEMY);
        InsMgr.event.off(HeroEvent.ATTENEMY);
        InsMgr.event.off(HeroEvent.HEROEND);
    }
}


