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
    private pools: Map<string, Array<Node>> = new Map<string, Array<Node>>();
    private records: Map<string, Record> = new Map<string, Record>();
    public create(key, data) {

        if (!this.pools.has(key)) {
            let pool = [];
            this.pools.set(key, pool)
            this.records.set(key, data)
        } else {
            console.error("key重复");
        }
    }

    public get(key: string): Node | null {
        let pool = this.pools.get(key);
        if (pool.length > 0) {
            return pool.shift()
        }
        return null;
    }

    public put(key, node: Node) {
        let pool = this.pools.get(key);
        if (pool) {
            pool.push(node);
        }
    }

    public delete(key) {
        if (this.pools.has(key)) {
            this.pools.delete(key);
        }
    }


}

export class MyObjPool<T> {
    private pool: T[] = []; // 对象池数组
    private maxPoolSize: number;        // 最大池容量
    private createObject: () => T;      // 创建新对象的工厂方法

    constructor(createObject: () => T, maxPoolSize: number = 10) {
        this.createObject = createObject;
        this.maxPoolSize = maxPoolSize;
    }
    get(): T {
        return this.pool.length > 0 ? this.pool.pop() : this.createObject();
    }
    put(obj: T) {
        if (this.pool.length < this.maxPoolSize) {
            this.pool.push(obj);
        }
    }

    poolSize() {
        return this.pool.length;
    }

    
}


