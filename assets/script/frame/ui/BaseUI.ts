import { _decorator, Component, Size, UITransform, Vec3 } from 'cc';
import { InsMgr } from '../InsMgr';
const { ccclass, property } = _decorator;

/**
 * The current parent class realisation divided into three main blocks.
 *  1.aostract methods
 *  2.private methods
 *  3.selectable methods
*/
@ccclass('BaseUI')
export abstract  class BaseUI extends Component {
    data: any;
    endCb: Function;
    size: Size;
    pos: Vec3;
    //Do not add to the event of first level clearance events
    event:Array<string>=[];
    protected onLoad(): void {
        this.onRegisterPreInfo();
        this.onRegisterEvent();
        this.onRegisterUI();
    }
    /**
     * Get a node or is component by path.
     * This method searches for the node in the current node and its children.
     * If the node is not found, an error will be displayed.
     * @param path The path of the node or component to be obtained
     * @param parent The parent node of the node or component to be obtained
     * @param type The type of the node or component to be obtained
     * 
     * */ 
    getNode(path, parent?, type?) {
        let resultNode = null;
        if (parent) resultNode = parent.getChildByPath(path)
        else resultNode = this.node.getChildByPath(path)
        if (resultNode) {
            if (type) return resultNode.getComponent(type)
        } else {
            console.error(`${path} not found`);
        }
        return resultNode;
    }
    //============================================ABSTRACT=============================================================
      /**
     *Abstract methods that mest be implemented by subclasses
     **/ 
     abstract onStart()
     abstract  unRegister();
 
    //============================================SELECTABLE=============================================================
    /**
     * Initialzes the Selectable component.
     * 
     * This method is called when the screen is initialized.
     * It is used to initialize the Selectable component and register events.
     * It is used to initialize the data and callback function passed from the previous screen.
     * @param data The data passed from the previous screen
     * @param endCb The callback function to be executed when the screen is closed
     * 
     * */ 
    onInit(data?, endCb?) {
        [this.data, this.endCb] = [data, endCb]
        if (typeof this.endCb=='function') this.endCb()
        this.onStart();
    }
    onRegisterPreInfo() {
        this.size = this.node.getComponent(UITransform).contentSize;
        this.pos = this.node.position;
    }
    onRegisterEvent() {}
    onRegisterUI(){}

    //============================================PRIVATE=============================================================
    /**
     *Private methods Clears all events form the current screen
     **/ 
    private _unRegisterEvent() {
        InsMgr.event.Clear(this,this.event);
    }
    protected onDestroy(): void {
        this._unRegisterEvent();
        this.unRegister();
    }
}


