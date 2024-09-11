import { _decorator, assetManager, Color, Component, Node, SpriteFrame, view } from 'cc';
import { ScrollListV } from '../test/ScrollListV';
import { itemPrefab } from './itemPrefab';
import { ToolHelper } from '../ToolHelper/ToolHelper';
import { config, GameConfigData } from '../TestMain';
import { LayerManager } from '../test/LayerManager';
const { ccclass, property } = _decorator;



@ccclass('GameListMgr')
export class GameListMgr extends Component {
    scorllNode: Node;
    item: Node;
    scrollListCtrl: ScrollListV;
    curIndex: number = -1;
    map: Map<string, SpriteFrame> = new Map();
    start() {
        this.scorllNode = this.node.getChildByName("ScrollView");
        this.item = this.node.getChildByName("Item");
        this.initScrollList();
        let handle = assetManager.getBundle("bundle");
        handle.loadDir("ui", SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error("err", err);
                return;
            }
            for (let i = 0; i < spriteFrame.length; i++) {
                let item = spriteFrame[i];
                this.map.set(item.name, item);
            }
            this.addData();
        })
    }

    initScrollList() {
        this.scrollListCtrl = this.scorllNode.addComponent(ScrollListV);
        this.scrollListCtrl.init(this.item, itemPrefab, view.getVisibleSize());
        this.scrollListCtrl.spaceY = 10;
    }
    addData() {
        let list = [];
        let itemRandom = ToolHelper.getRandomColor();
        let height = 50;
        for (let i = 0; i < GameConfigData.length; i++) {
            let color = new Color().fromHEX(itemRandom);
           let  itemHeight = 150 + Math.floor(Math.random() * height);
            let data = GameConfigData[i].data;
            let param = {
                spriteItem: this.map.get(data.SpriteName),
                color: color,
                itemHeight: itemHeight,
                type:GameConfigData[i].type,
                cb: (data, index, spriteFrame) => {
                    this.itemCb(Object.assign(data, {index:index}))
                }
            }
            list.push(Object.assign(data, param));
        }
        this.scrollListCtrl.setData(list)
    }

    itemCb(data) {
        LayerManager.Instance.show(data.type,
            data,
            () => {
                LayerManager.Instance.remove(config.GameList);
            })
    }
}


