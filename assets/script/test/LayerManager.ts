import { _decorator, assetManager, Component, director, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LayerManager')
export class LayerManager extends Component {
    private static instance: LayerManager = null;
    private layerList = {};
    public static get Instance() {
        if (this.instance == null) {
            this.instance = new LayerManager();
        }
        return this.instance;
    }

    show(name, param = null, cb = null) {
        let layer = this.has(name);
        if (layer) {
            console.warn("layer is exits");
            return;
        }
        let bundle = assetManager.getBundle("bundle");
        if (bundle) {
            this.load(bundle, name,param, cb);
        } else {
            assetManager.loadBundle("bundle", (err, bundle) => {
                if (err) {
                    console.error(`bundle ${name} error`);
                    return;
                }
                this.load(bundle, name,param, cb);
            });
        }
    }

    load(bundle, name, param = null, cb = null) {
        let path = `prefab/${name}`
        bundle.load(path, Prefab, (err, prefab) => {
            if (err) {
                console.error(`prefab ${name} error`);
                return;
            }
            let node = instantiate(prefab);
            this.layerList[name] = node;
            node.parent = director.getScene().getChildByName("Canvas");
            let mgr = node.addComponent(`${name}Mgr`)
            if (mgr && param) {
                mgr.init(param)
            }
            if (typeof cb == 'function')cb();
        });
    }

    has(name): Node {
        return this.layerList[name];
    }
    remove(name, type=null, cb = null) {
        let layer = this.has(name);
        if (layer) {
            layer.destroy();
            this.layerList[name] = null;
        } else {
            console.warn("layer not is exits");
        }

    }
}


