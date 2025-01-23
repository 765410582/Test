import { _decorator, Component, director, instantiate, Node,  UITransform } from 'cc';
import { LayerType, UIConfigData, UIID } from '../main/ViewConfig';
import { InsMgr } from './InsMgr';
import { BaseUI } from './ui/BaseUI';
const { ccclass, property } = _decorator;

@ccclass('LayerManager')
export class LayerManager extends Component {
    private layerList: any = {};
    private rootList = {};
    private nextLayer = [];
    /**
  * 创建UI层
  * 此函数负责在当前场景的Canvas下创建各种类型的UI层每个UI层都对应一个Node，并设置其属性
  * @param cb 可选的回调函数，当所有UI层创建完毕后调用
  */
    createUILayer(cb?) {
        let root = director.getScene().getChildByPath("Canvas/root");
        let keys = Object.keys(LayerType)
        let index = 0;
        let len = keys.length;
        for (const key of keys) {
            let type = LayerType[key];
            let node = new Node(type);
            node.addComponent(UITransform)
            InsMgr.tool.addWidget(node, { top: 1, bottom: 1, left: 1, right: 1 });
            node.parent = root;
            this.rootList[type] = node;
            index++
            if (index == len) {
                if (typeof cb == 'function') cb();
            }
        }
    }

    async show<T extends UIID>(name: T, param = null, cb: Function = null) {
        let layer1 = this.has(name);
        if (layer1) {
            console.warn("layer is exits",name);
            return;
        }
        let element = UIConfigData[name]
        let { handle, uiclass, layer } = element;
        let tprefab: any = await InsMgr.res.getPrefab(element);
        if (tprefab) {
            if (param) {
                param = Object.assign(param, { handle: handle })
            } else {
                param = { handle: handle }
            }
            let node = instantiate(tprefab);
            this.layerList[name] = node;
            node.parent = this.rootList[layer];
            InsMgr.tool.addWidget(node, { top: 1, bottom: 1, left: 1, right: 1 });
            let mgr = node.addComponent(uiclass) as BaseUI;
            if (mgr) mgr.onInit(param, cb);
            if (layer == LayerType.UI) {
                this.nextLayer.push(name);
            }
        }
    }
    /**
     * Checks if a node with the specified name exists.
     * 
     * This method checks for the presence of a node in the layerList by the given name.
     * It uses a generic parameter T to ensure that the provided name is of type UIID,
     * thus providing type safety at compile time.
     * 
     * @param name - The name of the node to check, must be of type UIID.
     * @returns The node object if found; otherwise, returns undefined.
     */

    has<T extends UIID>(name: T): Node {
        return this.layerList[name];
    }

    /**
     * Hides the specified UI layer.
     * 
     * This method destroys and removes the specified UI layer by name. If the UI layer does not exist, it logs a warning message.
     * 
     * @param name The name of the UI layer to hide, used to identify a specific UI layer.
     * @param cb An optional callback function that is called after the UI layer is destroyed.
     */
    hide<T extends UIID>(name: T, cb: Function = null) {
        let layer = this.has(name);
        if (layer) {
            layer.destroy();
            this.layerList[name] = null;
            if (typeof cb == 'function') cb();
        } else {
            console.warn("layer not is exits");
        }
    }
    //==================================================================处理层级-代码不太严谨=================================================================================

    /**
     * 获取下一个层级中的倒数第二个层级
     * 此方法旨在动态访问一个层级数组中的倒数第二个元素
     * 它假设NextLayer数组至少有两个元素
     * @returns  返回NextLayer数组中的倒数第二个元素
     */
    getPreLayer() {
        let len = this.nextLayer.length
        if (len >1) {
            return this.nextLayer[len - 2];
        }
        return null;
    }

    getCurLevel() {
        let len = this.nextLayer.length
        for (let i = len - 1; i >= 0; i--) {
            let element = UIConfigData[this.nextLayer[i]]
            if (element.layer == LayerType.UI) {
                return this.nextLayer[i];
            }
        }
    }



}


