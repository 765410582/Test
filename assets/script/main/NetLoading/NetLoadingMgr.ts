import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NetLoadingMgr')
export class NetLoadingMgr extends Component {
    private label:Label;
    private index:number=0;
    private loadingText:string="加载中";
    init(data?) {
        this.label=this.node.getChildByName("label").getComponent(Label)
        this.label.string=this.loadingText;
        this.schedule(this.onUpdate,0.3)
    }

    onUpdate(deltaTime: number) {
        this.index=(this.index+1)%(5);
        this.label.string=this.loadingText+(Array(this.index).join('.'));
        
    }
}


