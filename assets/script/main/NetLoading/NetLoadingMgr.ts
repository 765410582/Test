import { _decorator, Component, Label, Node } from 'cc';
import { BaseUI } from '../../frame/ui/BaseUI';
const { ccclass, property } = _decorator;

@ccclass('NetLoadingMgr')
export class NetLoadingMgr extends BaseUI {
    private label:Label;
    private index:number=0;
    private loadingText:string="加载中";

    onRegisterUI() {
        this.label=this.node.getChildByName("label").getComponent(Label)   
    }
    onStart(): void {
        this.label.string=this.loadingText;
        this.schedule(this.onUpdate,0.3)
    }

    onUpdate(deltaTime: number) {
        this.index=(this.index+1)%(5);
        this.label.string=this.loadingText+(Array(this.index).join('.'));
        
    }

    unRegister(){
        
    }
}


