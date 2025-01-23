import { _decorator, Component, Label, Node } from 'cc';
import { BaseUI } from '../../frame/ui/BaseUI';
import { InsMgr } from '../../frame/InsMgr';
import { UIID } from '../../main/ViewConfig';

const { ccclass, property } = _decorator;

@ccclass('WaitingMatchMgr')
export class WaitingMatchMgr extends BaseUI {
    timeLabel: Label;
    button: Node;

    watingTime: number = 0;
    onStart() {
        this.schedule(this.onUpdate, 1);

        
        InsMgr.net.sendTetrisReq(this.backCall);
    }
    onRegisterUI(): void {
        this.timeLabel = this.getNode("box/timeLabel", this.node, Label);
        this.button = this.getNode("box/btn");
        this.button.on('click', () => {
            InsMgr.layer.hide(UIID.WaitingMatch);
        }, this);
    }


    
      
    backCall(data){
        console.log("匹配数据",data);
        InsMgr.layer.hide(UIID.WaitingMatch);
        InsMgr.layer.hide(UIID.GameList);
        InsMgr.layer.show(UIID.Tetris,data);
    }
    onUpdate() {
        this.timeLabel.string = `正在匹配对手${this.watingTime++}秒`;

    }
    unRegister() {
        this.unschedule(this.onUpdate);
    }
}


