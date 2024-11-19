import { _decorator, Component, Label, Node } from 'cc';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
const { ccclass, property } = _decorator;
export interface GameOverType{
    title:string,
    confireCb?:Function,
    cancelCb?:Function,
    text:string,
    isConfire?:boolean,
    isCancel?:boolean
    
}
@ccclass('GameOverMgr')
export class GameOverMgr extends Component {
    textLabel:Label;
    back:Node;
    confrme:Node;
    cancel:Node;
    param: GameOverType;
    titleLabel: Label;
    init(param?:GameOverType) {
        this.param = param;
        this.regiterUI();
    }

    regiterUI() {
        this.textLabel=this.node.getChildByName("textLabel").getComponent(Label);
        this.titleLabel=this.node.getChildByName("titleLabel").getComponent(Label);
        this.back=this.node.getChildByName("back");
        this.confrme=this.node.getChildByName("confrme");
        this.cancel=this.node.getChildByName("cancel");

        this.back.on('click',()=>{
            InsMgr.layer.hide(UIID.GameOver);
            this.param.cancelCb()
        })
        this.confrme.on('click',()=>{
            InsMgr.layer.hide(UIID.GameOver);
            this.param.confireCb()
        })
        this.cancel.on('click',()=>{
            InsMgr.layer.hide(UIID.GameOver);
            this.param.cancelCb()
        })

        this.titleLabel.string=this.param.title;

        this.textLabel.string=this.param.text;
        this.confrme.active=this.param.isConfire;
        this.cancel.active=this.param.isCancel;
    }
}


