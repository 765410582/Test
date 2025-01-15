import { _decorator, Color, Component, Graphics, Size, v2, v3 } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('Graphics_Write')
export class Graphics_Write extends Component {
    @property(Graphics)
    writeGraphics: Graphics;
    size: number;
    nodeArr: any[] = [];
    tagArr: any[] = [];
    colorArr: any[][];
    targetSize: Size;
    
    initData(nodeArr: any[], size: number, targetSize: Size) {
        this.nodeArr = nodeArr;
        this.size = parseInt(size.toString());
        this.targetSize = targetSize;
        this.writeGraphics.clear();
        let once=false;//默认为单色
        once? this.writeOneColor():this.writeNightBar();
    }
    clear() {
        this.writeGraphics.clear();
    }
    writeOneColor() {
        let points = [];
        for (let i = 0; i < this.nodeArr.length; i++) {
            let pos: any = this.nodeArr[i]
            points.push(v3(pos.x * this.size, pos.y * this.size))
        }
        this.whriteBox(points);
    }

    writeNightBar() {
        let curList = [];
        let allLen = 1;
        let listCount = 0;
        let length = this.nodeArr.length;
        if (length <= 0) return;
        let index = 0;
        let lastPos = this.nodeArr.pop();
        curList[listCount] = new Array();
        curList[listCount].push(v2(lastPos.x * this.size, lastPos.y * this.size));
        let tempList = [];
        let runCount = 0;
        while (allLen < length) {
            runCount++;
            if (index <  this.nodeArr.length) {
                let pos = this.nodeArr[index];
                let delta = Math.abs(pos.x - lastPos.x) + Math.abs(pos.y - lastPos.y);
                let delta2=delta==1||delta == 2 && pos.x != lastPos.x && pos.y != lastPos.y;
                if (delta2) {
                    curList[listCount].push(v2(pos.x * this.size, pos.y * this.size));
                    tempList.push(pos);
                    allLen++;
                    this.nodeArr.splice(index, 1);
                }else{
                    index++;
                }
            } else if (tempList.length > 0) {
                index = 0;
                lastPos = tempList.pop();
            } else if (this.nodeArr.length > 0) {
                listCount++;
                index = 0;
                lastPos = this.nodeArr.pop();
                curList[listCount] = new Array();
                curList[listCount].push(v2(lastPos.x * this.size, lastPos.y * this.size));
                allLen++;
            }
        }
        // console.log("curList:", curList);
        // console.log("当前运行次数：",runCount);
        let colors = [Color.RED, Color.GREEN, Color.BLUE, Color.CYAN, Color.MAGENTA, Color.YELLOW]
        let colorIndex = 0;
        for (let i = 0; i < curList.length; i++) {
            this.whriteBox(curList[i], true, colors[colorIndex]);
            colorIndex = (colorIndex + 1) % colors.length;
        }
    }


    whriteBox(temp_arr, box = true, color = Color.RED) {
        let size = this.size;
        let targetSize = this.targetSize;
        this.writeGraphics.strokeColor = color;
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
}


