import { _decorator, Component, Label, Node } from 'cc';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
const { ccclass, property } = _decorator;

@ccclass('GameOverMgr')
export class GameOverMgr extends Component {
    textLabel:Label;
    back:Node;
    confrme:Node;
    cancel:Node;
    param: any;
    init(param?) {
        this.param = param;
        this.regiterUI();
    }

    regiterUI() {
        this.textLabel=this.node.getChildByName("textLabel").getComponent(Label);
        this.back=this.node.getChildByName("back");
        this.confrme=this.node.getChildByName("confrme");
        this.cancel=this.node.getChildByName("cancel");

        this.back.on('click',()=>{
            InsMgr.layer.hide(UIID.GameOver);
            this.param.cb&&this.param.cb(true);
        })
        this.confrme.on('click',()=>{
            InsMgr.layer.hide(UIID.GameOver);
            this.param.cb&&this.param.cb(true);
        })
        this.cancel.on('click',()=>{
            InsMgr.layer.hide(UIID.GameOver);
            this.param.cb&&this.param.cb(true);
        })

        this.textLabel.string=this.param.text;
    }

    update(deltaTime: number) {
        
    }
}


