import { _decorator, Asset, AssetManager, assetManager, Component, Node, Prefab, resources } from 'cc';
import { InsMgr } from './InsMgr';

const { ccclass, property } = _decorator;

@ccclass('ResLoadMode')
export class ResLoadMode extends Component {
    private tempbundle: AssetManager.Bundle = null;
    constructor() {
        super();
    }

    // 1.resources 资源加载
    private async getPrefabResources(prefabName): Promise<Prefab> {
        return await new Promise(async (resolve, reject) => {
            await resources.load(prefabName, Prefab, (err, prefab) => {
                if (err) {
                    console.error(`resources ${prefabName} error！！！`);
                    return;
                }
                resolve(prefab);
            });
        })
    }
    // 2.bundle 预加载
    private async getBundle(bundleName) {
        if (!this.tempbundle) {
            await new Promise(async (resolve) => {
                await assetManager.loadBundle(bundleName, (err, data) => {
                    if (err) {
                        console.error(`${bundleName}is eror!!!`);
                        return;
                    }
                    this.tempbundle = data;
                    resolve(data)
                })
            }).then(data => {
                console.log(`加载完成 ${bundleName} temp bundle!!!`);
            })
        }
        return this.tempbundle;
    }

    // ================================<1>显示进度条加载================================
    /**
     * desc: 获取加载列表
     * param: element:{handle:string,path:string,type:string}
     * param: progressCallback: (progress: number) => void
     * param: callback: (prefab: Prefab) => void
     * return: Promise<Prefab>
     * 
    */
    public async loadBundles(element, progressCallback, callback) {
        let bundle = await this.getBundle(element.handle);
        this.loadRes(bundle, element, progressCallback, callback);
    }

    private loadRes(bundle, element, progressCallback, callback) {
        //进度回调函数
        let onProgress = (finish: number, total: number, item) => {
            progressCallback(finish, total);
        }
        //完成回调函数
        let onComplete = (err: Error, assets: Asset[]) => {
            if (err) {
                console.log('err', err);
                return;
            }
            callback && callback(assets);
        }
        bundle.loadDir(element.path, element.type, onProgress, onComplete)
    }
    // <2>只加载prefab 
    private async getPrefabBundle(element): Promise<Prefab> {
        let bundle = await this.getBundle(element.handle);
        return await new Promise(async (resolve, reject) => {
            await bundle.load(element.prefab, Prefab, (err, prefab) => {
                if (err) {
                    console.error(`handle ${element.prefab} error!!!`);
                    return;
                }
                resolve(prefab);
            });
        })
    }

    //=============================获取prefab=============================
    /**
     * desc: 获取prefab
     * param: element:{handle:string,prefab:string}
     * return: Promise<Prefab>
     * 
    */
    public async getPrefab(element): Promise<Prefab> {
        let prefab= InsMgr.data.getFindPrefab(element.prefab);
        if (prefab&&prefab.value) {
            return prefab.value;
        } else {
            let { handle, prefab } = element;
            if (handle === "resources") {
                return await InsMgr.res.getPrefabResources(prefab);
            } else {
                return await InsMgr.res.getPrefabBundle(element);
            }
        }
    }

    // 3.url 远程加载





}


