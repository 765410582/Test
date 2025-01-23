import { _decorator, Component, Node, Prefab, Texture2D } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('DataDictionary')
export class DataDictionary extends Component {
    private entries: Map<string, any>;
    constructor() {
        super()
        this.entries = new Map();
    }
    setData(key, value, description?) {
        this.entries.set(key, { key, value, description });
    }


    getData(key: string) {
        let obj: any = { key: key, value: null, description: null };
        if (this.entries.has(key)) {
            return this.entries.get(key);
        }
        return null;
    }

    setLocalData(key, value){
        localStorage.setItem(key,value)
    }
    getLocalData(key){
        return localStorage.getItem(key)
    }

    getUserProperty<T, K extends keyof T>(user: T | null | undefined, key: K): T[K] {
        if (user === null || user === undefined)
            return null;
        const value= user[key];
        return value;
    }

    getUserPropertys<T extends keyof K,K>(value: K): (keys: T[]) => Pick<K, T> {
        return function (keys: T[]): Pick<K, T> {
            if (!value) return null;
            const selectedUser: Partial<K> = {};
            for(const key of keys){
                selectedUser[key] = value[key];
            }
            return selectedUser as Pick<K, T>;
        };
    }
    getQueryData(predicate) {
        const result = [];
        for (const item of this.entries.values()) {
            if (predicate(item)) {
                result.push(item);
            }
        }
        return result;
    }

    clear() {
        this.entries.clear();
    }

    size(): number {
        return this.entries.size;
    }
    print() {
        console.log("==============打印数据 STRAT=====================");
        for (const [key, value] of this.entries) {
            console.log(`${key}: ${ value.description}`);
        }
        console.log(this.entries);
        console.log("==============打印数据 END=====================");
    }
   
    getPrefab(name:string) {
        let prefabs = name.split("/")
        let data: any = this.getData(prefabs[prefabs.length - 1]);
        return data;
    }

}


