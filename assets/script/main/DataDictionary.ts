import { _decorator, Component, Node, Prefab, Texture2D } from 'cc';
const { ccclass, property } = _decorator;
export interface ResData {
    key: string;
    value: any;
    description?: string
}
type TempTest<T> = T extends ResData ? T : never;
@ccclass('DataDictionary')
export class DataDictionary extends Component {
    private entries: Map<string, ResData>;
    constructor() {
        super()
        this.entries = new Map();
    }
    setData(key, value, description?) {
        this.entries.set(key, { key, value, description });
    }

    remove(key): boolean {
        if (this.entries.has(key)) {
            return this.entries.delete(key);
        }
    }

    getData(key: string): ResData | null {
        let obj: any = { key: key, value: null, description: null };
        if (this.entries.has(key)) {
            return this.entries.get(key);
        }
        return null;
    }

    getUserProperty<T, K extends keyof T>(user: T | null | undefined, key: K): T[K] {
        if (user === null || user === undefined)
            return null;
        const value= user[key];
        return value;
    }
    /**
     * 根据用户ID和指定的键获取用户信息
     * 
     * 此函数通过接收一个用户ID和一个键数组，从存储中提取该用户的相关信息，并返回一个仅包含指定键对应值的对象
     * 它使用了泛型T来确保类型安全，使得返回值的类型反映了传入的键的类型
     * 
     * @param id 用户ID，用于在存储中查找用户信息
     * @param keys 指定需要提取的用户信息的键数组
     * @returns 返回一个仅包含指定键对应值的用户信息对象
     */
    getUser<T extends keyof ResData>(id, keys: T[]): Pick<ResData, T> {
        let value = this.entries.get(id)
        if (!value) return null;
        const selectedUser: Partial<ResData> = {};
        keys.forEach((key) => {
            selectedUser[key] = value[key];
        });
        return selectedUser as Pick<ResData, T>;
    }
    queryData(predicate) {
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
        console.log("entries", this.entries);
    }
   
    getFindPrefab(name:string) {
        let prefabs = name.split("/")
        let data: any = this.getData(prefabs[prefabs.length - 1]);
        return data;
    }

}


