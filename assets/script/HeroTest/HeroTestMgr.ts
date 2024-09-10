import { _decorator, assetManager, Component, instantiate, Label, Node, Prefab, Size, UITransform, v3 } from 'cc';
import { LayerManager } from '../test/LayerManager';
import { config, EventType } from '../TestMain';
import { enemy } from './enemy';
import { hero } from './hero';
import { buttlet } from './buttlet';
import { EventMgr } from '../test/EventMgr';
const { ccclass, property } = _decorator;

@ccclass('HeroTestMgr')
export class HeroTestMgr extends Component {
    enemyList: Node[] = [];
    heroList: Node[] = [];
    buttletList: Node[] = [];
    boxSize: Size;
    maxPos: import("cc").math.Vec3;
    minPos: import("cc").math.Vec3;
    enemyLabel: Label;
    dieEnemy: number = 0;
    buttletLevel: number = 1;
    pause: boolean = true;
    init(param?) {
        this.boxSize = this.node.getComponent(UITransform).contentSize
        this.enemyLabel = this.node.getChildByName("infoLabel").getComponent(Label) as Label;
        console.log("HeroTestMgr init", param);
        this.node.getChildByName("reBtn").on('click',this.onReturn, this);
        this.schedule(this.onUpdate, 0.03)
        this.addHero();
        this.maxPos = v3(this.boxSize.width / 2, this.boxSize.height / 2, 0)
        this.minPos = v3(-this.boxSize.width / 2, -this.boxSize.height / 2, 0)
       
    }

    onUpdate(deltaTime: number) {
        //浏览器兼容差
        requestIdleCallback(dealline => {
            if (dealline.timeRemaining() > 0.1) {
                this.addEnemy();
            }
        });
    }


    addHero() {
        let bundle = assetManager.getBundle("bundle");
        bundle.load("prefab/hero", Prefab, (err, prefab) => {
            let node = instantiate(prefab);
            node.parent = this.node;
            node.addComponent(hero).init({
                maxPos: this.maxPos, minPos: this.minPos, id: this.heroList.length, cb: (pos) => {
                    this.addButtlet1(pos);
                }
            });
        });
    }
    addEnemy() {
        let bundle = assetManager.getBundle("bundle");
        bundle.load("prefab/enemy", Prefab, (err, prefab) => {
            let node = instantiate(prefab);
            node.parent = this.node;
            if (!this.pause) return;
            node.addComponent(enemy).init({
                maxPos: this.maxPos, minPos: this.minPos, id: 0, cb: (state = true) => {
                    this.dieEnemy++;
                    this.updateEnemyLabel();
                }, buttletLevel: this.buttletLevel
            });
            this.enemyList.push(node);
            this.updateEnemyLabel();
        });
    }



    addButtlet(pos, angle) {
        let bundle = assetManager.getBundle("bundle");
        bundle.load("prefab/buttlet", Prefab, (err, prefab) => {
            let node = instantiate(prefab);
            node.parent = this.node;
            if (!this.pause) return;
            node.addComponent(buttlet).init({ pos: v3(pos.x, pos.y, 0), maxPos: this.maxPos, angle: angle });
        });
    }

    // 子弹类型1
    addButtlet1(pos) {
        this.addButtlet(pos, 0)
        let angleArr = [[30, 0], [60, 0], [90, 0], [120, 0]]
        for(let i=0;i<=this.buttletLevel;i++){
            let angles = angleArr[i];
            this.addButtlet(v3(pos.x + angles[0], pos.y+50, 0), angles[1])
            this.addButtlet(v3(pos.x - angles[0], pos.y+50, 0), -angles[1])
        }
    }

    updateEnemyLabel() {
        let length = this.enemyList.length;
        this.enemyLabel.string = "enemy: " + this.dieEnemy + "/" + length + "=>" + (length - this.dieEnemy);
        this.buttletLevel = Math.floor(this.dieEnemy / 1000);
        if (this.buttletLevel > 2) {
            this.buttletLevel = 2;
        }
    }

    onReturn() {
        
        EventMgr.Instance.displayer(EventType.GameEnd,{
            page:config.HeroTest,
            suc:()=>{
                this.pause = false;
            }
        });
    }

    protected onDestroy(): void {
     
    }
}


