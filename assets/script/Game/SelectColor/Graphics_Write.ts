import { _decorator, Component, Graphics, Node, Size, UITransform, v2, v3 } from 'cc';
import { InsMgr } from '../../frame/InsMgr';
const { ccclass, property } = _decorator;
@ccclass('Graphics_Write')
export class Graphics_Write extends Component {

    @property(Graphics)
    writeGraphics: Graphics;
    size: number;
    nodeArr: any[] = [];
    tagArr: any[] = [];
    colorArr: any[][];
    initData(nodeArr: any[], size: number, targetSize: Size, colorArr) {
        this.nodeArr = nodeArr;
        this.colorArr = colorArr;
        this.size = parseInt(size.toString());
        let point = this.getAllPoint();
        this.writeGraphics.clear();
        let temp_arr = point;
        let box = false;
        for (let i = 0; i < temp_arr.length; i++) {
            let pos = temp_arr[i]
            let posx = targetSize.width / 2;
            let posy = targetSize.height / 2;
            if (box) {
                this.writeGraphics.rect(pos.x - posx + 2, pos.y - posy + 1, size, size)
            } else {
                this.writeGraphics.circle(pos.x - posx + 2 + size / 2, pos.y - posy + 1 + size / 2, size / 2)
            }

        }
        this.writeGraphics.stroke();
    }
    getAllPoint() {
        let points = [];
        for (let i = 0; i < this.nodeArr.length; i++) {
            let pos: any = this.nodeArr[i]
            points.push(v3(pos.x * this.size, pos.y * this.size))
        }
        return points;
    }

    clear() {
        this.writeGraphics.clear();
    }
}


