import { _decorator, assetManager, Color, Component, instantiate, Label, Node, ScrollView, SpriteFrame, view } from 'cc';
import { itemPrefab } from './itemPrefab';
import { LayerManager } from '../../frame/LayerManager';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
const { ccclass, property } = _decorator;

@ccclass('GameListMgr')
export class GameListMgr extends Component {
    scorllNode: Node;
    item: Node;
    scrollListCtrl: ScrollView;
    titleLabel: Label;
    init(data?) {
        this.scorllNode = this.node.getChildByName("ScrollView");
        this.item = this.node.getChildByName("Item");
        this.titleLabel = this.node.getChildByName("titleLabel").getComponent(Label);
        this.titleLabel.string = "GAMELIST";
        this.scrollListCtrl = this.scorllNode.getComponent(ScrollView)
        this.addData();
        
    }
    addData() {
        let dataArray = [
            UIID.ChessBoard
            , UIID.GravityRollerCoaster
            , UIID.HeroTest
            , UIID.RedGreenLight
            , UIID.SelectColor
            ,UIID.Tetris
        ];
        let randomColor = [
            "#fd6d6c"
            , "#4c9cff"
            , "#4ccc31"
            , "#da68ff"
        ]
        let len=dataArray.length;
        for (let i = 0; i <len; i++) {
            let color = new Color().fromHEX(randomColor[Math.floor(Math.random() * randomColor.length)]);
            let param = {
                color: color,
                type: dataArray[i],
                itemIndex:i,
                cb: (data, index, spriteFrame) => {
                    this.itemCb(Object.assign(data, { index: index,background:spriteFrame }))
                }
            }
            this.getItem(param);
        }
    }

    protected getItem(param) {
        let node= instantiate(this.item);
        node.parent = this.scrollListCtrl.content;
        let titemPrefab = node.addComponent(itemPrefab)
        titemPrefab.data = param;
        titemPrefab.itemIndex = param.itemIndex;
        titemPrefab.dataChanged();
        return node;
    }
    itemCb(data) {
        InsMgr.layer.show(data.type,
            data,
            () => {
                InsMgr.layer.hide(UIID.GameList);
            })
    }
}