import { _decorator, Color, Component, Node, v2, Vec2 } from 'cc';
import { InsMgr } from '../../frame/InsMgr';
import { EventType } from '../../TestMain';
const { ccclass, property } = _decorator;
//表达方块
//旋转方块
//下落方块
//消除方块
enum CLICKTYPE {
    NONE = -1,
    BLACK,
    WHITE
}
const direction = [
    v2(0, 1),
    v2(0, -1),
    v2(1, 0),
    v2(-1, 0)
]



interface GameResult {
  blackScore: number;
  whiteScore: number;
  winner: CLICKTYPE;
  margin: number; // 胜负的差距
}
@ccclass('Tetris')
export class Tetris extends Component {
    mapWidth;
    mapHeight;
    gridList: any[][];
    tagQueue: any[][];
    type: CLICKTYPE = CLICKTYPE.NONE;
    runCount: number = 0;
    blackCaptures:number=0;
    wilteCaptures:number=0;
    constructor(_mapWidth, _mapHeight) {
        super();
        this.mapWidth = _mapWidth;
        this.mapHeight = _mapHeight;
        this.initTetris();
        this.setCurrentType(CLICKTYPE.BLACK);
       
    }


    initTetris() {
        this.gridList = new Array(13);
        this.tagQueue = new Array(13);
        for (let i = 0; i < 13; i++) {
            this.gridList[i] = [];
            this.tagQueue[i] = [];
            for (let j = 0; j < 13; j++) {
                this.gridList[i][j] = CLICKTYPE.NONE;
                this.tagQueue[i][j] = false;
            }
        }
    }

    getGridTetris() {
        return this.gridList;
    }
    getCurrentType() {
        return this.type;

    }

    setCurrentType(type: CLICKTYPE) {
        this.type = type;
        let data = { status: 0, type: this.type }
        InsMgr.event.emit(EventType.TetrisMgr, data);
    }

    IsBlock(type) {
        return type == CLICKTYPE.BLACK
    }
    checkResult(x, y) {
        return this.gridList[x][y] != CLICKTYPE.NONE
    }

    setGridType(x, y, type = CLICKTYPE.NONE) {
        if (type === CLICKTYPE.NONE) {
            type = this.getCurrentType();
        }
        this.gridList[x][y] = type;
        this.findSameColorArea(x, y, type);
    }

    // 查找和自己相邻的色块区域
    findSameColorArea(x, y, type) {
        this.runCount = 0;
        this.clearFlash();
        let tmepQueue = this.recardForData(x, y, type);
        let queue = this.enemyAbout(tmepQueue, type);
        let removeList = this.eatContent(queue);
        if (removeList.length == 0) {
            if (this.IsRule(x, y, type)) {
                this.clearAll(removeList, queue,type)
                this.cutPawns(type);
            } else {
                alert("当前落子违反规定，不能落子");
            }
        } else {
            this.clearAll(removeList, queue,type)
            this.cutPawns(type);
        }
        console.log("==============最大执行次数:%s=================", this.runCount);
    }
//================================================start=============================================================================
    // 记录四个方向数据
    recardForData(x, y, type) {
        let tmepQueue = [];
        for (let i = 0; i < 4; i++) {
            let x1 = x + direction[i].x;
            let y1 = y + direction[i].y;
            if (x1 >= 0 && x1 < 13 && y1 >= 0 && y1 < 13) {
                let block = this.gridList[x1][y1];
                if (block != type && block != CLICKTYPE.NONE) {
                    tmepQueue.push({ x: x1, y: y1, base: null });
                }
            }
        }
        return tmepQueue;
    }
    // 给当前落子接触的敌对区域分类
    enemyAbout(tmepQueue, type) {
        let initBase = 0;
        let result = true;
        let queue = [];
        while (result) {
            this.runCount++;
            if (tmepQueue.length > 0) {
                let temp = tmepQueue.pop();
                let { x, y, base } = temp;
                if (!this.tagQueue[x][y]) {
                    base = base === null ? initBase++ : base;
                    queue[base] ? queue[base] : queue[base] = [];
                    queue[base].push({ x: x, y: y, base: base });
                    for (let j = 0; j < 4; j++) {
                        let x1 = x + direction[j].x;
                        let y1 = y + direction[j].y;
                        if (x1 >= 0 && x1 < 13 && y1 >= 0 && y1 < 13) {
                            let target = this.gridList[x1][y1];
                            if (type !== target && target != CLICKTYPE.NONE) {
                                tmepQueue.push({ x: x1, y: y1, base: base });
                            }
                        }
                    }
                    this.tagQueue[x][y] = true;
                }
            } else {
                result = false;
            }
        }
        return queue;
    }

    // 检测吃掉内容
    eatContent(queue) {
        let index = 0;
        let tag = 0;
        let removeList = [];
        let isRemove = true;
        while (queue.length > tag) {
            this.runCount++;
            if (queue[tag].length > index) {
                let { x, y } = queue[tag][index++];
                for (let j = 0; j < 4; j++) {
                    let x1 = x + direction[j].x;
                    let y1 = y + direction[j].y;
                    if (x1 >= 0 && x1 < 13 && y1 >= 0 && y1 < 13) {
                        let target = this.gridList[x1][y1];
                        if (target == CLICKTYPE.NONE) {
                            isRemove = false;
                        }
                    }
                }
            } else {
                if (isRemove) {
                    removeList.push(tag);
                }
                isRemove = true;
                index = 0;
                tag++
            }
        }

        return removeList;
    }
    // 落子是否合规
    IsRule(x, y, type) {
        this.clearFlash();
        // 1.获取当前落子区域集合
        let resultList = this.getTetrisList({ x: x, y: y, base: type });
        // 2.查看区域集合有没有至少两个空间
        let nullList = this.getActiveSpace(resultList);
        // 3.如果只有一个空间，去掉落子痕迹   
        if (nullList.length == 0) {
            this.gridList[x][y] = CLICKTYPE.NONE;
            return false;
        } else {
            return true;
        }
    }
    // 1.获取当前落子区域集合
    getTetrisList(temp) {
        let tmepQueue = [temp];
        let queue = [];
        while (tmepQueue.length > 0) {
            let temp = tmepQueue.pop();
            let { x, y, base } = temp;
            this.runCount++;
            if (!this.tagQueue[x][y]) {
                queue.push(temp);
                this.tagQueue[x][y] = true;
                for (let i = 0; i < 4; i++) {
                    let x1 = x + direction[i].x;
                    let y1 = y + direction[i].y;
                    if (x1 >= 0 && x1 < 13 && y1 >= 0 && y1 < 13) {
                        let target = this.gridList[x1][y1];
                        if (base == target && target != CLICKTYPE.NONE) {
                            tmepQueue.push({ x: x1, y: y1, base: base });
                        }
                    }
                }
            }
        }
        return queue;
    }

    // 获取当前其类型活动空间
    getActiveSpace(queue) {
        let index = 0;
        let nullList = [];
        while (queue.length > index) {
            let { x, y } = queue[index++];
            this.runCount++;
            for (let j = 0; j < 4; j++) {
                let x1 = x + direction[j].x;
                let y1 = y + direction[j].y;
                if (x1 >= 0 && x1 < 13 && y1 >= 0 && y1 < 13) {
                    let target = this.gridList[x1][y1];
                    if (target == CLICKTYPE.NONE) {
                        nullList.push(v2(x1, y1));
                    }
                }
            }
        }
        return nullList;

    }

    // 切换棋子
    cutPawns(type) {
        if (this.IsBlock(type)) {
            this.setCurrentType(CLICKTYPE.WHITE);
        } else {
            this.setCurrentType(CLICKTYPE.BLACK);
        }
    }
    // 清除所有消除
    clearAll(removeList, queue,type) {
        if (removeList.length > 0) {
            for (let i = 0; i < removeList.length; i++) {
                for (let j = 0; j < queue[removeList[i]].length; j++) {
                    this.gridList[queue[removeList[i]][j].x][queue[removeList[i]][j].y] = CLICKTYPE.NONE;
                    if(type==CLICKTYPE.BLACK){
                        this.blackCaptures++;
                    }else {
                        this.wilteCaptures++;
                    }
                }
            }
        }
    }

    clearFlash() {
        for (let i = 0; i < 13; i++) {
            for (let j = 0; j < 13; j++) {
                this.tagQueue[i][j] = false;
            }
        }
    }
//===================================================end==========================================================================



// 计算胜利条件
 calculateScore(board:any[][], blackCaptures: number, whiteCaptures: number, komi: number =0): GameResult {
  let blackTerritory = 0;
  let whiteTerritory = 0;
  // 遍历棋盘，统计地盘
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === CLICKTYPE.BLACK) {
        blackTerritory++;
      } else if (board[i][j] === CLICKTYPE.WHITE) {
        whiteTerritory++;
      }
    }
  }

  // 计算总分
  const blackScore = blackTerritory + blackCaptures;
  const whiteScore = whiteTerritory + whiteCaptures + komi;

  // 判断胜负
  const winner = blackScore > whiteScore ? CLICKTYPE.BLACK : CLICKTYPE.WHITE;
  const margin = Math.abs(blackScore - whiteScore);

  return {
    blackScore,
    whiteScore,
    winner,
    margin,
  };
}
}


