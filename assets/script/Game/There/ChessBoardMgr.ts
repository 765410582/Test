import { _decorator, Component, Node, v2, Vec2, Vec3 } from 'cc';
import { GridView, RuleType } from './view/GridView';
import { GameModel } from './model/GameModel';
import { GridHeight, GridWidth, isPlayAnim } from './ConstValue';

import { CellView } from './view/CellView';
import { InsMgr } from '../../frame/InsMgr';

const { ccclass, property } = _decorator;
/**
 * 判断给定的坐标是否超出网格的边界
 *
 * 此函数用于确定一个点（由其x和y坐标表示）是否位于定义的网格之外
 * 网格的大小由 gridHeight 和 gridWidth 参数定义
 *
 * @param x 待检查点的x坐标
 * @param y 待检查点的y坐标
 * @param gridHeight 网格的高度
 * @param gridWidth 网格的宽度
 * @returns 返回一个布尔值，指示点是否超出网格边界
 * 如果x小于0或大于等于gridHeight，或者y小于0或大于等于gridWidth，则返回true，表示点超出边界
 * 否则返回false，表示点在边界内
 */
export function isPointOutOfGrid(x, y, gridHeight = GridHeight, gridWidth = GridWidth) {
    // 初始化result变量以判断坐标是否超出边界
    let result = x < 0 || x >= gridWidth
        || y < 0 || y >= gridHeight;
    // 返回坐标是否超出边界的布尔值
    return result;
}

export enum GameStatus {
    View = "View",
    Model = "Model"
}
@ccclass('ChessBoardMgr')
export class ChessBoardMgr extends Component {
    gridView: GridView;
    gameModel: GameModel;
    reBtn: Node;
    chessIds: string[];
    passData = {};
    touchLock = false;
    isCanMove = true;
    constructor() {
        super();
        this.chessIds = [
            "chess_1", "chess_2", "chess_3", "chess_4"
        ];

        let LevelPassData = [
            {
                Level: 1,
                Type: RuleType.ArrayMiss,
                RuleData: [
                    v2(0, 0),
                    v2(0, GridHeight - 1),
                    v2(GridWidth - 1, 0),
                    v2(GridWidth - 1, GridHeight - 1),
                ]
            },
            {
                Level: 2,
                Type: RuleType.ColMiss,
                RuleData: [v2(0, Math.floor(GridWidth / 2)), v2(0, Math.floor(GridWidth / 4))]
            }
            ,
            {
                Level: 3,
                Type: RuleType.RowMiss,
                RuleData: [v2(Math.floor(GridHeight / 2), 0)]
            }
        ]
        this.passData = LevelPassData[0];
        this.gameModel = new GameModel();
        this.gridView = new GridView();

    }
    init(data = null) {
        this.initView();
        this.changeGrid(null);
    }

    initView() {
        InsMgr.tool.reBtnCall(this.node.getChildByName("reBtn"));
    }

    changeGrid(data: [][]) {
        let tData = this.gameModel.initModel(data, this.getChessIds());
        this.gridView.initView(this.node, tData, this.chessIds.length, this.passData);
        this.initTouchEvent(this.node);
    }

 

    getChessIds() {
        return this.chessIds;
    }

    initTouchEvent(parentRoot) {
        parentRoot.on(Node.EventType.TOUCH_START, function (eventTouch) {
            this.handleTouchEvent(eventTouch, Node.EventType.TOUCH_START);
        }, this);
        parentRoot.on(Node.EventType.TOUCH_MOVE, function (eventTouch) {
            this.handleTouchEvent(eventTouch, Node.EventType.TOUCH_MOVE);
        }, this);

        parentRoot.on(Node.EventType.TOUCH_END, function (eventTouch) {
            touchFinish.bind(this)();
        }, this);

        parentRoot.on(Node.EventType.TOUCH_CANCEL, function (eventTouch) {
            touchFinish.bind(this)();
        }, this);
        function touchFinish(){
            this.touchLock = false;
        }
    }

    handleTouchEvent(eventTouch, eventType) {
        if (eventType === Node.EventType.TOUCH_START) {
            if (this.touchLock) return;
            this.touchLock = true;
        }else if (eventType === Node.EventType.TOUCH_MOVE && !this.isCanMove) {
            return;
        }
        let spacePos = InsMgr.tool.screenPosToSpacePos(eventTouch, this.node);
        let pos = this.gridView.getTouchPosToCell(spacePos);
        if (pos) {
            let { x, y } = pos;
            let view = this.gridView.getData(x,y)
            if (!view) return;
            let cellView = view.getComponent(CellView)
            new Promise((resolve, reject) => {
                if (!isPlayAnim) {
                    resolve(true);
                    return;
                }
                cellView.tweenRun(0.1, () => {
                    resolve(true);
                });
            }).then(() => {
                this.gridView.setSelectPosition(view.getPosition());
                let changeModels = this.selectSell(pos)
                if (eventType === Node.EventType.TOUCH_START) {
                    this.isCanMove = changeModels.length < 3;
                }
            }).catch(err => {
                console.error("动画执行失败", err);
                this.touchLock = false;
            })
        }
    }

    selectSell(pos: Vec3) {
        let arr = this.gameModel.selectSell(pos);
        if(arr.length>0){
            this.gridView.updateView(arr);
        }
        this.gameModel.clearCmd();
        return arr;
    }
    protected onDestroy(): void {
        delete this.gridView;
        delete this.gameModel;
    }


}


