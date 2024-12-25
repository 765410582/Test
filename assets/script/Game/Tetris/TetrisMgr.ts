import { _decorator, Component, Graphics, Label, Node, UITransform } from 'cc';
import { InsMgr } from '../../frame/InsMgr';
import { Tetris } from './Tetris';
const { ccclass, property } = _decorator;
import { l10n } from 'db://localization-editor/l10n'
import { BaseUI } from '../../frame/ui/BaseUI';
@ccclass('TetrisMgr')
export class TetrisMgr extends BaseUI {
    tetris: Tetris;
    GridLayer: Graphics;
    titleLabel: Label;
    onStart() {
        this.tetris = new Tetris(8, 13);
        this.tetris.initData();
        for(let i=0;i<1;i++){
            console.log('=======================%s======================',i);
            const block = this.tetris.getBlockRand();
            this.tetris.setBlockData(block);
        }
        let gridWidth =this.size.width / this.tetris.mapWidth;
        let gridHeight = this.size.height / this.tetris.mapHeight;
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
    onRegisterUI() {
        InsMgr.tool.reBtnCall(this.node.getChildByName("reBtn"));
        this.GridLayer = this.node.getChildByName("GridLayer").getComponent(Graphics)
        this.titleLabel=this.node.getChildByName("titleLabel").getComponent(Label)
        this.titleLabel.string=l10n.t("write");
    }

    unRegister() {
    }
}


