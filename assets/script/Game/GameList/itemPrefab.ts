import { _decorator, assetManager, Color, Component, Label, Node, Size, Sprite, SpriteFrame, sys, UITransform } from 'cc';
import { IItem } from '../../frame/IItem';
import { SaveStatus } from '../SelectColor/SelectColorMgr';
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
        this.label.string = `<<${this.itemIndex}>`;
        this.sprite.color = this.data.color;
        let dic=InsMgr.data.find("ui"+this.itemIndex);
        this.sprite.spriteFrame=<SpriteFrame>dic.value;
    }
    public onClick() {
        if (typeof this.data.cb == "function") {
            this.sprite.color = this.data.color;
            let dic=InsMgr.data.find("ui"+this.itemIndex);
            this.data.cb(this.data, this.itemIndex,<SpriteFrame>dic.value)
        }
    }

  
}



