import { _decorator, assetManager, Color, Component, ImageAsset, Label, Node, Size, Sprite, SpriteFrame, sys, Texture2D, UITransform } from 'cc';
import { IItem } from '../../frame/IItem';
import { InsMgr } from '../../frame/InsMgr';


const { ccclass, property } = _decorator;

@ccclass('itemPrefab')
export class itemPrefab extends Component implements IItem {
    /**数据 */
    public data: any = null;
    /**索引 0表示第一项*/
    itemIndex: number;
    /**数据改变时调用 */
    label: Label;
    sprite: Sprite;
    protected onLoad(): void {
        this.label = this.node.getChildByName("Label").getComponent(Label);
        this.sprite = this.node.getChildByName("Sprite").getComponent(Sprite);
        this.sprite.node.on('click', this.onClick, this)
    }
    public dataChanged() {
        this.label.string = `{${this.itemIndex}}`;
        // this.sprite.color =Color.WHITE;
        let data = InsMgr.data.getData("ui" + this.itemIndex);
        let tproperty=InsMgr.data.getUserProperty(data,"value");
        if(tproperty){
            this.sprite.spriteFrame =tproperty;
        }
    }

    
    public onClick() {
        if (typeof this.data.cb == "function") {
            let data = InsMgr.data.getData("ui" + this.itemIndex);
            let tproperty=InsMgr.data.getUserProperty(data,"value");
            this.data.cb(this.data, this.itemIndex, tproperty)
        }
    }
}



