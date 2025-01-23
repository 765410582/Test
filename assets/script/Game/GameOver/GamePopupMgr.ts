import { _decorator, Component, Label, Node } from 'cc';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
import { BaseUI } from '../../frame/ui/BaseUI';
const { ccclass, property } = _decorator;
export interface GameOverType {
    title: string,
    confireCb?: Function,
    cancelCb?: Function,
    text: string,
    isConfire?: boolean,
    isCancel?: boolean

}
@ccclass('GamePopupMgr')
export class GamePopupMgr extends BaseUI {

    textLabel: Label;
    back: Node;
    confrme: Node;
    cancel: Node;
    titleLabel: Label;
    onStart() {
        let { title, text, isConfire, isCancel } = this.data;
        this.titleLabel.string = title;
        this.textLabel.string = text;
        this.confrme.active = isConfire;
        this.cancel.active = isCancel;
    }
    unRegister() {

    }
    onRegisterUI() {
        this.textLabel = this.node.getChildByName("textLabel").getComponent(Label);
        this.titleLabel = this.node.getChildByName("titleLabel").getComponent(Label);
        this.back = this.node.getChildByName("back");
        this.confrme = this.node.getChildByPath("layout/confrme");
        this.cancel = this.node.getChildByPath("layout/cancel");
    }

    onRegisterEvent(): void {
        this.back.on('click', () => {
            InsMgr.layer.hide(UIID.GamePopup);
            this.data.cancelCb&&this.data.cancelCb()
        })
        this.confrme.on('click', () => {
            InsMgr.layer.hide(UIID.GamePopup);
            this.data.confireCb&&this.data.confireCb()
        })
        this.cancel.on('click', () => {
            InsMgr.layer.hide(UIID.GamePopup);
            this.data.cancelCb&&this.data.cancelCb()
        })
    }
}


