import { _decorator, assetManager, Color, Component, ImageAsset, Label, Node, Size, Sprite, SpriteFrame, sys, Texture2D, UITransform } from 'cc';
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
        this.sprite.color =Color.WHITE;
        let dic = InsMgr.data.find("tex" + this.itemIndex).value as Texture2D;
        this.sprite.spriteFrame = <SpriteFrame>this.getSprieOnImage(dic);
    }

    getSprieOnImage(tex: Texture2D): SpriteFrame {
        let sf = new SpriteFrame();
        sf.texture = tex;
        return sf;
    }
    public onClick() {
        if (typeof this.data.cb == "function") {
            this.sprite.color =Color.GRAY;
            let dic = InsMgr.data.find("ui" + this.itemIndex);
            this.data.cb(this.data, this.itemIndex, <SpriteFrame>dic.value)
        }
    }
}



