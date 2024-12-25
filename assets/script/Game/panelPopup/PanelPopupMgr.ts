import { _decorator, Component, RichText, ScrollView } from 'cc';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
import { BaseUI } from '../../frame/ui/BaseUI';

const { ccclass, property } = _decorator;

@ccclass('PanelPopupMgr')
export class PanelPopupMgr extends BaseUI {
    label_text: RichText;
    bg_layer: Node;
    btn_confrim: Node;
    btn_cancel: Node;
    btn_exit: Node;
    onStart() {
        this.label_text.string = this.data.explanation;
    }
    

    onRegisterUI() {
        this.label_text = 
        this.node.getChildByName("view")
        .getComponent(ScrollView)
        .content.getChildByName("RichText")
        .getComponent(RichText);
        this.node.getChildByName("retrunbtn")
        .on('click', () => {
            InsMgr.layer.hide(UIID.PanelPopup);
        })
    }

    onRegisterEvent(){

    }
    
    unRegister() {
     
    }
}


