import { _decorator, Component, Node, v2, Vec2 } from 'cc';
const { ccclass, property } = _decorator;
//表达方块
//旋转方块
//下落方块
//消除方块

@ccclass('Tetris')
export class Tetris extends Component {
    mapData;
    blockData;
    mapWidth;
    mapHeight;
    constructor(_mapWidth, _mapHeight) {
        super();
        this.mapWidth = _mapWidth;
        this.mapHeight = _mapHeight;
    }


    initData() {
        this.mapData = new Array(this.mapHeight);
        this.blockData = new Array(4);

    }

    getBlockRand() {
        let blockArr = [
            [v2(0, 0), v2(0, 1), v2(1, 1), v2(1, 0)],
            [v2(0, 0), v2(1, 0), v2(2, 0), v2(3, 0)],

            [v2(0, 0), v2(1, 0), v2(1, 1), v2(2, 0)],


            [v2(0, 0), v2(1, 0), v2(2, 0), v2(2, 1)],
            [v2(0, 1), v2(1, 1), v2(2, 1), v2(2, 0)],

            [v2(0, 0), v2(1, 0), v2(1, 1), v2(2, 1)],
            [v2(0, 1), v2(1, 1), v2(1, 0), v2(2, 0)],
        ]
        let index = Math.floor(Math.random() * blockArr.length);
        console.log("index", index,blockArr[index]);
        return blockArr[index];
    }


    setBlockData(data) {
        this.blockData = data;
        this.toBlockRoto();
    }
    toBlockRoto() {
        let width = 0;
        let height = 0;
        for (let i = 0; i < this.blockData.length; i++) {
            height = Math.max(height, this.blockData[i].y);
            width = Math.max(width, this.blockData[i].x);
        }
        let centerPoint = v2(Math.floor(width / 2), Math.floor(height / 2));
        console.log("中心点:x:" + centerPoint.x + "y:" + centerPoint.y);
        console.log("旋转前:", this.blockData);
        let result = this.rotateTetromino(this.blockData, centerPoint, 90);
        console.log("旋转后:", result);

    }

    // 旋转矩阵函数
    rotatePoint(point: Vec2, center: Vec2, angle: number): Vec2 {
        const x = point.x - center.x;
        const y = point.y - center.y;
        const newX = center.x + x * Math.cos(angle) - y * Math.sin(angle);
        const newY = center.y + x * Math.sin(angle) + y * Math.cos(angle);
        return v2(Math.round(newX), Math.round(newY));
    }

    // 旋转操作，适用于所有方块
    rotateTetromino(tetromino: Vec2[], center: Vec2, angle: number): Vec2[] {
        let arr=[];
        for(let i=0;i<tetromino.length;i++){
            let point = tetromino[i];
            arr.push(this.rotatePoint(point, center, angle));
        }
        return arr;
    }

}



