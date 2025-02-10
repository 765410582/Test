import { _decorator, assetManager, Color, Component, instantiate, Label, Node, ScrollView, SpriteFrame, view } from 'cc';
import { itemPrefab } from './itemPrefab';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
import { l10n } from 'db://localization-editor/l10n'
import { BaseUI } from '../../frame/ui/BaseUI';
const { ccclass, property } = _decorator;

@ccclass('GameListMgr')
export class GameListMgr extends BaseUI {
    scorllNode: Node;
    item: Node;
    scrollListCtrl: ScrollView;

    onRegisterUI(){
        this.scorllNode = this.getNode("ScrollView"); 
        this.item =this.getNode("Item"); 
        this.getNode("titleLabel",null,Label).string = l10n.t("gamelisttitle");
        this.scrollListCtrl =this.scorllNode.getComponent(ScrollView); 
    }

    onStart(): void {
        this.addData();
    }
    
    addData() {
        let dataArray = [UIID.HeroTest,UIID.GravityRollerCoaster,UIID.WaitingMatch,UIID.ColorList,UIID.RedGreenLight];
        let result = InsMgr.data.getQueryData(item => item.key.indexOf("ui") != -1)
        for (let i = 0; i < dataArray.length; i++) {
            let param = {type: dataArray[i],itemIndex: i,
                cb: (data, index, spriteFrame) => {
                    this.itemCb(Object.assign(data, { index: index, background: spriteFrame}))
                }
            }
            this.getItem(param);
        }
    }

    getItem(param) {
        let node = instantiate(this.item);
        node.parent = this.scrollListCtrl.content;
        let titemPrefab = node.addComponent(itemPrefab)
        titemPrefab.data = param;
        titemPrefab.itemIndex = param.itemIndex;
        titemPrefab.dataChanged();
        return node;
    }
    itemCb(data) {
        if (!data.type) { return;}
        InsMgr.layer.show(data.type, data, () => {
            if (data.type == UIID.WaitingMatch) { return; }
            InsMgr.layer.hide(UIID.GameList);
        });
    }
    unRegister(){
        
    }
}