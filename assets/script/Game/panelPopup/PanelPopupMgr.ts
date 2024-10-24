import { _decorator, Component, Label, Node, RichText, ScrollView } from 'cc';

import { LayerManager } from '../../frame/LayerManager';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';

const { ccclass, property } = _decorator;

@ccclass('PanelPopupMgr')
export class PanelPopupMgr extends Component {
    label: RichText;
    retrunbtn: Node;
    init(data?) {
        console.log("panelPopupMgr");
        this.reigerUI();
        console.log("data:", data.explanation);
        this.label.string = data.explanation;
    }

    reigerUI() {
        this.label = this.node.getChildByName("view").getComponent(ScrollView).content.getChildByName("RichText").getComponent(RichText);
        this.retrunbtn = this.node.getChildByName("retrunbtn");
        this.retrunbtn.on('click', () => {
            InsMgr.layer.hide(UIID.PanelPopup);
        })
    }
}


