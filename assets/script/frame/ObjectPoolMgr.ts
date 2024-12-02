import { _decorator, Component, Node, NodePool } from 'cc';
import { InsMgr } from './InsMgr';
const { ccclass, property } = _decorator;
export interface Record {
    usageCounter: number,
    releaseCounter: number,
    minSize: number,
    maxSize: number,
    shrinkThreshold: number,
    createObject: Function
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
    private pools: Map<string,NodePool> = new Map<string, NodePool>();
    private records: Map<string, Record> = new Map<string, Record>();
    public create(key, data=null) {
        if (!this.pools.has(key)) {
            let pool =new NodePool();
            this.pools.set(key, pool)
            this.records.set(key, data)
        }
    }

    public get(key: string): Node | null {
        let pool = this.pools.get(key);
        if (pool.size() > 0) {
            return pool.get()
        }
        return null;
    }

    public put(key, node: Node) {
        if(this.pools.has(key)){
            let pool = this.pools.get(key);
            if (pool) {
                pool.put(node);
            }else{
                node.destroy();
            }
        }else{
            node.destroy();
        }
    }

    public delete(key) {
        if (this.pools.has(key)) {
            this.pools.clear();
        }
    }


}


