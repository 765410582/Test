import { _decorator, Color, Component, Graphics, Label, Node, UITransform, v3 } from 'cc';
import { InsMgr } from '../../frame/InsMgr';
import { Tetris } from './Tetris';
const { ccclass, property } = _decorator;
import { BaseUI } from '../../frame/ui/BaseUI';
import { EventType } from '../../TestMain';
import { UIID } from '../../main/ViewConfig';

enum TetrisStatus {
    Win = "win",
    Fail = "fail",
    White = "white",
    Block = "block"
}

@ccclass('TetrisMgr')
export class TetrisMgr extends BaseUI {
    tetris: Tetris;
    GridLayer: Graphics;
    titleLabel: Label;
    girdBlock: number;
    curLabel: Label;
    winnerLabel: Label;


    onStart() {

        this.tetris = new Tetris(13, 13);
        let gridWidth = this.size.width / this.tetris.mapWidth;
        let gridHeight = this.size.height / this.tetris.mapHeight;
        this.girdBlock = gridHeight;
        if (gridHeight > gridWidth) {
            this.girdBlock = gridWidth
        }

        this.updateTetris();
        this.onRegisterTouch();


    }
    onRegisterUI() {
        InsMgr.tool.reBtnCall(this.getNode("reBtn"), () => {
            InsMgr.net.sendSelfTetrisExitReq()
        });
        this.GridLayer = this.node.getChildByName("GridLayer").getComponent(Graphics)
        this.titleLabel = this.node.getChildByName("titleLabel").getComponent(Label)
        this.titleLabel.string = "Tetris";
        this.curLabel = this.getNode("GameInfo/curLabel", this.node, Label);
        this.winnerLabel = this.getNode("GameInfo/winnerLabel", this.node, Label);
    }

    onRegisterTouch(): void {
        this.node.on(Node.EventType.TOUCH_START, (event) => {
            let location = event.getLocation();
            let pos = v3(location.x * 2, location.y * 2, 0);
            let posx = parseInt((pos.x / this.girdBlock).toString())
            let posy = parseInt((pos.y / this.girdBlock).toString())
            if (this.tetris.checkResult(posx, posy)) {
                console.error("当前位置已有棋子");
                return;
            }
            this.tetris.setGridType(posx, posy);
            this.GridLayer.clear();
            this.updateTetris();
            const result = this.tetris.calculateScore(this.tetris.getGridTetris(), this.tetris.blackCaptures, this.tetris.wilteCaptures);
            this.winnerLabel.string = `${result.blackScore} VS ${result.whiteScore}\r\n${result.winner == 0 ? "黑" : "白"}离胜利更近`;
        })
    }

    onRegisterEvent(): void {
        InsMgr.event.on(EventType.TetrisMgr, this.UpdateInfo, this);
        InsMgr.net.sendTetrisExitReq((res) => {
            console.log("棋盘游戏结果", res)
            let { Data } = res;
            switch (Data.state) {
                case TetrisStatus.Win:
                    InsMgr.layer.show(UIID.GameList);
                    InsMgr.layer.hide(UIID.Tetris);
                    InsMgr.layer.show(UIID.GamePopup,{
                        title:"你胜利了",
                        text:"获得胜利，积分等",
                        isConfire:true,
                        isCancel:false,
                    });
                    break;
                case TetrisStatus.Fail:
                    InsMgr.layer.show(UIID.GameList);
                    InsMgr.layer.hide(UIID.Tetris);          
                    InsMgr.layer.show(UIID.GamePopup,{
                        title:"你失败了",
                        text:"获得失败，积分等",
                        isConfire:true,
                        isCancel:false,
                    });
                    break;
                case TetrisStatus.Block:
                    break;
                case TetrisStatus.White:
                    break;
                default:
                    console.log("错误的类型" + Data.status);
            }
        })
    }

    updateTetris() {
        const setoff = v3(0, 0, 0);
        // 纵向
        for (let i = 0; i < this.tetris.mapHeight; i++) {
            this.GridLayer.moveTo(i * this.girdBlock, this.girdBlock + setoff.y);
            this.GridLayer.lineTo(i * this.girdBlock, this.tetris.mapHeight * this.girdBlock + setoff.y);
        }
        // 横向
        for (let j = 1; j < this.tetris.mapHeight + 1; j++) {
            this.GridLayer.moveTo(0, j * this.girdBlock + setoff.y);
            this.GridLayer.lineTo(this.tetris.mapWidth * this.girdBlock, j * this.girdBlock + setoff.y);
        }
        this.GridLayer.stroke();
        let gridTetris = this.tetris.getGridTetris();
        for (let i = 0; i < gridTetris.length; i++) {
            for (let j = 0; j < gridTetris[i].length; j++) {
                if (gridTetris[i][j] !== -1) {
                    const pos = v3(i * this.girdBlock, j * this.girdBlock, 0 + setoff.y)
                    // this.GridLayer.moveTo(pos.x, pos.y);
                    if (this.tetris.IsBlock(gridTetris[i][j])) {
                        this.GridLayer.fillColor = Color.BLACK;
                    } else {
                        this.GridLayer.fillColor = Color.WHITE;
                    }
                    this.GridLayer.circle(pos.x + this.girdBlock, pos.y + this.girdBlock, this.girdBlock * 0.45)
                    this.GridLayer.fill();
                    this.GridLayer.stroke();
                }
            }
        }
    }

    UpdateInfo(event, data) {
        // 1. 当前行棋类型
        // 2. 棋盘结束后的结果
        let { status, type } = data;
        if (status == 0) {
            let text = type == 0 ? "黑" : "白";
            this.curLabel.string = `${text}方行棋`
        }
    }

    unRegister() {
    }
}


