import { _decorator, assetManager, Color, Component, Node, SpriteFrame, view } from 'cc';
import { ScrollListV } from '../test/ScrollListV';
import { itemPrefab } from './itemPrefab';
import { ToolHelper } from '../ToolHelper/ToolHelper';
import { config } from '../TestMain';
import { LayerManager } from '../test/LayerManager';
const { ccclass, property } = _decorator;

let GameConfig = {
    ["dasf0"]: { name: config.SelectColor, width: 31, height: 31, SpriteName: "item1", },
    ["dasf1"]: { name: config.SelectColor, width: 15, height: 15, SpriteName: "item2" },
    ["dasf2"]: { name: config.SelectColor, width: 25, height: 25, SpriteName: "item3" },
    ["dasf3"]: { name: config.SelectColor, width: 27, height: 27, SpriteName: "item4" },
    ["dasf4"]: { name: config.SelectColor, width: 17, height: 17, SpriteName: "item5" },
    ["dasf5"]: { name: config.SelectColor, width: 16, height: 16, SpriteName: "item6" },
    ["dasf6"]: { name: config.SelectColor, width: 22, height: 22, SpriteName: "item7" },
    ["dasf8"]: { name: config.SelectColor, width: 45, height: 45, SpriteName: "item8" },
    ["dasf9"]: { name: config.SelectColor, width: 46, height: 46, SpriteName: "item9" },
    ["dasf10"]: { name: config.HeroTest, width: 46, height: 46, SpriteName: "item1" },
    ["dasf11"]: { name: config.ChessBoard, width: 46, height: 46, SpriteName: "item1" },


}

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
        let arr = []
        let keys = Object.keys(GameConfig);
        let itemRandom = ToolHelper.getRandomColor();
        for (let i = 0, len = keys.length; i < len; i++) {
            let color = new Color().fromHEX(itemRandom)
            let height = 150;
            arr.push({
                SpriteName: GameConfig[keys[i]].SpriteName, value: GameConfig[keys[i]].name, height: height, color: color, cb: (data, curIndex, spriteFreme) => {
                    LayerManager.Instance.show(data.value,
                        {
                            width: GameConfig[keys[curIndex]].width, height: GameConfig[keys[curIndex]].height,
                            index: curIndex, SpriteName: GameConfig[keys[curIndex]].SpriteName
                            , spriteFreme: spriteFreme
                        }, () => {
                            LayerManager.Instance.remove(config.GameList);
                        });
                },
                spriteItem: this.map.get(GameConfig[keys[i]].SpriteName)

            })
        }
        this.scrollListCtrl.setData(arr)
    }
}


