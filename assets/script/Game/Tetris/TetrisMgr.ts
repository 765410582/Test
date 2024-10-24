import { _decorator, Component, Graphics, Node, UITransform } from 'cc';
import { InsMgr } from '../../frame/InsMgr';
import { Tetris } from './Tetris';
const { ccclass, property } = _decorator;

@ccclass('TetrisMgr')
export class TetrisMgr extends Component {
    tetris: Tetris;
    GridLayer: Graphics;
    init(data?) {
       
        this.tetris = new Tetris(8, 13);
        this.tetris.initData();
       
        for(let i=0;i<1;i++){
            console.log('=======================%s======================',i);
            const block = this.tetris.getBlockRand();
            this.tetris.setBlockData(block);
        }
        this.RegiterUI();
    }

    RegiterUI() {
        InsMgr.tool.reBtnCall(this.node.getChildByName("reBtn"));
        this.GridLayer = this.node.getChildByName("GridLayer").getComponent(Graphics)

        let {width,height}=this.node.getComponent(UITransform).contentSize
        let gridWidth = width / this.tetris.mapWidth;
        let gridHeight = height / this.tetris.mapHeight;
        let girdBlock=gridHeight;
        if(gridHeight > gridWidth){
            girdBlock=gridWidth
        }
        // 绘制表格
        for (let i = 0; i < this.tetris.mapHeight; i++) {
            for (let j = 0; j < this.tetris.mapWidth; j++) {
                this.GridLayer.moveTo(j * girdBlock, i * girdBlock);
                this.GridLayer.lineTo(j * girdBlock + girdBlock, i * girdBlock);
                this.GridLayer.moveTo(j * girdBlock, i * girdBlock);
                this.GridLayer.lineTo(j * girdBlock, i * girdBlock + girdBlock);
            }
        }
        this.GridLayer.stroke();

    }

    update(deltaTime: number) {

    }
}


