import { _decorator, assetManager, Color, Component, Label, Node, Size, Sprite, SpriteFrame, sys, UITransform } from 'cc';
import { IItem } from '../test/IItem';
import { ToolHelper } from '../ToolHelper/ToolHelper';
import { SaveStatus } from '../SelectColor/SelectColorMgr';

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
    sprite1: Sprite;
    protected onLoad(): void {
        this.label = this.node.getChildByName("Label").getComponent(Label);
        this.sprite = this.node.getChildByName("Sprite").getComponent(Sprite);
        this.sprite1 = this.node.getChildByName("icon").getComponent(Sprite);
        let retryButton = this.node.getChildByName("retryButton")
        let delButton=this.node.getChildByName("delButton");
        retryButton.on('click', this.onRetryData, this)
        delButton.on('click', this.onDelData, this)
        this.sprite.node.on('click', this.onClick, this)
    }
    public dataChanged() {
        this.label.string = `Level ${this.itemIndex}`;
        let nodeTransform = this.node.getComponent(UITransform)
        nodeTransform.contentSize = new Size(nodeTransform.contentSize.width, this.data.height);
        this.sprite.color = this.data.color;
       this.sprite1.spriteFrame=this.data.spriteItem;
    }
    public onClick() {
        if (typeof this.data.cb == "function") {
            this.sprite.color = this.data.color;
            this.data.cb(this.data, this.itemIndex, this.sprite1.spriteFrame)
        }
    }

    public onRetryData() {
        let levelKey = 'level' + this.itemIndex
        let levelData = {
            value: null,
            state: SaveStatus.FINISH//-1未开始 0:未完成 1:已完成  
        }
        let value = JSON.stringify(levelData);
        sys.localStorage.setItem(levelKey, value);
    }
    public onDelData() {
        let levelKey = 'level' + this.itemIndex
        let levelData = {
            value: null,
            state: SaveStatus.UNFINISH//-1未开始 0:未完成 1:已完成  
        }
        let value = JSON.stringify(levelData);
        sys.localStorage.setItem(levelKey, value);
    }
}



