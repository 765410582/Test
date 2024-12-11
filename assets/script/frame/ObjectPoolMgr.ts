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
    private static s_instance: ObjectPoolMgr = null;
    private key_map: Map<string, NodePool> = new Map<string, NodePool>();
    private key_record: Map<string, number> = new Map<string, number>();
    public static get instance() {
        if (!this.s_instance) {
            this.s_instance = new ObjectPoolMgr();
        }
        return this.s_instance;
    }
    
    public create(key) {
        if (!this.key_map.has(key)) {
            this.key_map.set(key, new NodePool(key))
            this.key_record.set(key, 0)
        }
    }

    public get(key: string): Node | null {
        let pool = this.key_map.get(key);
        if (pool.size() > 0) {
            let max_size = this.key_record.get(key);
            InsMgr.event.emit(HeroEvent.UDPATEPOOL, { key: key, count: pool.size() - 1,max_size: max_size });
            return pool.get()
        }
        return null;
    }

    public put(key, node: Node) {
        if (this.key_map.has(key)) {
            let pool = this.key_map.get(key);
            if (pool) {
                pool.put(node);
                const size = pool.size();
                if (this.key_record.get(key) < size) {
                    this.key_record.set(key, size)
                }
                let max_size = this.key_record.get(key);
                InsMgr.event.emit(HeroEvent.UDPATEPOOL, { key: key, count: size, max_size: max_size });
            } else {
                node.destroy();
            }
        } else {
            node.destroy();
        }
    }
    public size(key) {
        let pool = this.key_map.get(key);
        return pool.size();
    }

    public clear() {
         this.key_map.forEach((value,key)=>{
            value.clear();
         })
         this.key_map.clear();
    }


}


