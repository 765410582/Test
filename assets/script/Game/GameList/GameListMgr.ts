import { _decorator, assetManager, Color, Component, instantiate, Label, Node, ScrollView, SpriteFrame, view } from 'cc';
import { itemPrefab } from './itemPrefab';
import { LayerManager } from '../../frame/LayerManager';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
import { l10n } from 'db://localization-editor/l10n'
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
        this.titleLabel.string = l10n.t("gamelisttitle");
        this.scrollListCtrl = this.scorllNode.getComponent(ScrollView)
        this.addData();
        let tobj=InsMgr.data.getData("ui1")
        let tdata=InsMgr.data.getUser(tobj,["description","key","value"]);
        console.log("tdata:",tdata);

    }
    addData() {
        let dataArray = [
            UIID.ChessBoard
            , UIID.GravityRollerCoaster
            , UIID.HeroTest
            , UIID.RedGreenLight
            , UIID.SelectColor
            , UIID.Tetris, , , ,, , , ,, , , ,, , , ,,
            , , , ,, , , ,, , , ,, , , ,, , , ,, , , ,
            , , , ,, , , ,, , , ,, , , ,, , , ,, , , ,
        ];
        let result = InsMgr.data.queryData(item => item.value.name.indexOf("item") != -1)
      
        for (let i = 0; i < result.length; i++) {
            let param = {
                type: dataArray[i],
                itemIndex: i,
                cb: (data, index, spriteFrame) => {
                    this.itemCb(Object.assign(data, { index: index, background: spriteFrame }))
                }
            }
            this.getItem(param);
        }
    }

    protected getItem(param) {
        let node = instantiate(this.item);
        node.parent = this.scrollListCtrl.content;
        let titemPrefab = node.addComponent(itemPrefab)
        titemPrefab.data = param;
        titemPrefab.itemIndex = param.itemIndex;
        titemPrefab.dataChanged();
        return node;
    }
    itemCb(data) {
        if (!data.type) {
            console.log("type is null");
            return;
        }
        InsMgr.layer.show(data.type,
            data,
            () => {
                InsMgr.layer.hide(UIID.GameList);
            })
    }
}