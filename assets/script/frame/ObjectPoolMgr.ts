import { _decorator, Component, Node, NodePool } from 'cc';
import { InsMgr } from './InsMgr';
import { HeroEvent } from '../Game/HeroTest/HeroTestMgr';
const { ccclass, property } = _decorator;


//伤害飘字预制体
//子弹预制体
export enum PoolType {
    DAMAGE = "damage",
    BULLET = "bullet",
    ENEMY = "enemy",
    ENEMY_BULLET = "enemy_bullet",
    ENEMY_BULLET_SECOND = "enemy_bullet_second",
    ENEMY_BULLET_FOUR = "enemy_bullet_four",
    ENEMY_BULLET_WALL = "enemy_bullet_wall",

}

@ccclass('ObjectPoolMgr')
export class ObjectPoolMgr extends Component {
    private static _instance: ObjectPoolMgr = null;

    public static get instance() {
        if (!this._instance) {
            this._instance = new ObjectPoolMgr();
        }
        return this._instance;
    }
    private pools: Map<string, NodePool> = new Map<string, NodePool>();
    private records: Map<string, number> = new Map<string, number>();
    public create(key) {
        if (!this.pools.has(key)) {
            let pool = new NodePool(key);
            this.pools.set(key, pool)
            this.records.set(key, 0)
        }
    }

    public get(key: string): Node | null {
        let pool = this.pools.get(key);
        if (pool.size() > 0) {
            let max_size = this.records.get(key);
            InsMgr.event.emit(HeroEvent.UDPATEPOOL, { key: key, count: pool.size() - 1,max_size: max_size });
            return pool.get()
        }
        return null;
    }

    public put(key, node: Node) {
        if (this.pools.has(key)) {
            let pool = this.pools.get(key);
            if (pool) {
                pool.put(node);
                const size = pool.size();
                if (this.records.get(key) < size) {
                    this.records.set(key, size)
                }
                let max_size = this.records.get(key);
                if(typeof max_size!="number"){
                    max_size=0;
                    console.log("this.records",this.records);
                }
                InsMgr.event.emit(HeroEvent.UDPATEPOOL, { key: key, count: size, max_size: max_size });
            } else {
                node.destroy();
            }
        } else {
            node.destroy();
        }
    }

    public size(key) {
        let pool = this.pools.get(key);
        return pool.size();
    }

    public delete(key) {
        if (this.pools.has(key)) {
            this.pools.clear();
        }
    }

    public clear() {
         this.pools.forEach((value,key)=>{
            value.clear();
         })
         this.pools.clear();
    }


}


