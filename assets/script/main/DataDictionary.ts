import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;
export interface DictionaryEntry<T> {
    key: string;
    value: T;
    description?: string
}
@ccclass('DataDictionary')
export class DataDictionary<T> extends Component {
    private entries: Map<string, DictionaryEntry<T>>;
    constructor() {
        super()
        this.entries = new Map();
    }
    add(key, value, description?) {
        this.entries.set(key, { key, value, description });
    }

    remove(key): boolean {
        if (this.entries.has(key)) {
            return this.entries.delete(key);
        }
    }
    find(key): DictionaryEntry<T> {
        if (this.entries.has(key)) {
            return this.entries.get(key);
        } else {
            return { key: key, value: null, description: null };
        }
    }
    clear() {
        this.entries.clear();
    }

    size(): number {
        return this.entries.size;
    }
    print(){
        console.log("entries",this.entries);
    }
/**
 * 根据提供的谓词过滤字典条目。
 * @param predicate - 用于判断是否保留条目的函数。
 * @returns 过滤后的数据字典。
 */
    filter(predicate: (entry: DictionaryEntry<T>) => boolean):DataDictionary<T>{
        let filtedDictionary=new DataDictionary<T>();
        this.entries.forEach( enter=>{
            if(predicate(enter)){
                filtedDictionary.add(enter.key,enter.value,enter.description);
            }
        })
        return filtedDictionary;
    }
/**
 * 遍历字典中的每个条目
 * 
 * 此方法接受一个回调函数作为参数，该回调函数将依次应用于字典中的每个条目
 * 它提供了一种灵活的方式来处理或操作每个条目的数据
 * 
 * @param callback - 一个接受字典条目作为参数的回调函数
 *                   该回调函数将在字典的每个条目上调用
 */
    forEach(callback: (entry: DictionaryEntry<T>) => void) {
        this.entries.forEach(callback);
    }

    /**
 * 将当前字典中的每个条目映射为一个新的值，并返回这些新值的数组
 * 
 * @param transform 一个函数，用于将字典中的每个条目转换为新的值
 * @returns 返回一个数组，包含将字典中的每个条目通过transform函数转换后得到的新值
 */
    map<U>(transform: (entry: DictionaryEntry<T>) => U): U[] {
        return Array.from(this.entries.values()).map(transform);
    }

    get isLoad():boolean{
        return this.entries.size>0;
    }

    getFindPrefab(name):  DictionaryEntry<T> {
        let prefabs = name.split("/")
        let data: any = this.find(prefabs[prefabs.length - 1]);
        return data;
    }

}


