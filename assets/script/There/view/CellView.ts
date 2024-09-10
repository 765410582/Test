import { _decorator, Component, Node, tween, v3 } from 'cc';
import { Model } from '../model/GameModel';
const { ccclass, property } = _decorator;

@ccclass('CellView')
export class CellView extends Component {
    model: Model;
    init(model) {
        this.model = model;
    }

    tweenRun(time = 0.5,cb=null) {
        let scale = 0.7;
        let move = tween(this.node)
            .to(time, { scale: v3(scale, scale) })
            .delay(0.1)
            .to(time, { scale: v3(1, 1) })
            .call(() => {
                let { id, x, y } = this.model;
                console.log("id:", id, x, y);
                cb&&cb(this.model);
            })
        move.start();
    }

    //回收节点 保持棋盘总的节点不变
    recycle() {

    }

}


