import { _decorator, Component, Node, v3 } from 'cc';
import { InsMgr } from '../../frame/InsMgr';
import { TimeType } from '../../frame/GameTime';
import { HeroEvent } from './HeroTestMgr';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends Component {
    param: any;
    init(param) {
        this.param=param;
        this.node.position=this.param.start;   
    }

    updatePh(att:number){
        this.param.ph-=att;
        if(this.param.ph<=0){
            InsMgr.event.emit(HeroEvent.HEROEND, {result:false,text:"你已经死亡，是否退出游戏？"});
        }
    }

}


