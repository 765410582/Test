import { _decorator, v2, Vec2, Vec3 } from 'cc';
import { ChessFlag, ChessStatus, ChessType, GridHeight, GridWidth } from '../ConstValue';
import { ToolHelper } from '../../ToolHelper/ToolHelper';
import { isPointOutOfGrid } from '../ChessBoardMgr';
const { ccclass, property } = _decorator;
export interface Model {
   x: number;
   y: number;
   id: string;
   type: ChessType;
   status: ChessStatus;
   flag?: ChessFlag;
   canLine(): boolean;
}

@ccclass('GameModel')
export class GameModel {
   models: Model[][];
   lastPos: Vec3=null;
   initModel(data: [][] = null, chessIds: string[] = null) {
      this.models = new Array(GridWidth)
      for (let i = 0; i < GridWidth; i++) {
         this.models[i] = new Array(GridHeight);
         for (let j = 0; j < GridHeight; j++) {
            this.models[i][j] = null;
         }
      }
      this.changeModels(data, chessIds);
      return this.models;
   }
   changeModels(data: [][] = null, chessIds: string[] = null) {
      for (let i = 0; i < GridWidth; i++) {
         for (let j = 0; j < GridHeight; j++) {
            let tmodel = {
               x: i,
               y: j,
               id: null,
               type: ChessType.Chess,
               status: ChessStatus.NONE,
               flag: ChessFlag.NONE,
               canLine: () => {
                  return true;
               }
            }
            if (data) {
               this.readModel(tmodel, i, j, data);
            } else {
               this.randomModel(tmodel, i, j, chessIds);
            }
         }
      }
   }
   readModel(tmodel, i, j, data) {
      /**
       * 根据规则读取数据
       */
      let id = data[i][j];
      tmodel.id = id;
      this.models[i][j] = tmodel;
   }
   randomModel(tmodel, i, j, chessIds) {
      let falg = true
      let tempIds = [];
      while (falg) {
         let id = ToolHelper.getListRanodm(chessIds, tempIds);
         tempIds.push(id);
         tmodel.id = id;
         this.models[i][j] = tmodel;
         if (this.checkPoint(i, j, true).type !== ChessType.NONE) {
            continue;
         } else {
            falg = false;
            break;
         }
      }
   }

   checkPoint(x: number, y: number, checkType: boolean = false) {
      let rowResult = this.checkWithDirection(x, y, [v2(1, 0), v2(-1, 0)]);
      let colResult = this.checkWithDirection(x, y, [v2(0, 1), v2(0, -1)]);
      let type = ChessType.NONE;
      let flyPoints = [];
      let chessTypes = [5, 3, 4, 3]
      let chessTypes_1 = [ChessType.ChessFive, ChessType.ChessTL, ChessType.ChessFour, ChessType.Chess]
      for (let i = 0; i < chessTypes.length; i++) {
         let result = this.getPointResults(rowResult, colResult, chessTypes[i], i == 1 ? true : false)
         if (result) {
            flyPoints = result;
            type = chessTypes_1[i];
            break;
         }
      }
      const result = {
         type: type,
         flyPoints: flyPoints,
         pos: v2(x, y),
      }
      return result;
   }
   getPointResults(arr1, arr2, rabet, checkType = false) {
      let rowLen = arr1.length;
      let colLen = arr2.length;
      if (checkType) {
         if (rowLen >= rabet && colLen >= rabet) {
            return this.mergePointArray(arr1, arr2);
         } else {
            return null;
         }
      } else {
         if (rowLen >= rabet) {
            return arr1;
         } else if (colLen >= rabet) {
            return arr2;
         } else {
            return null;
         }
      }

   }

   mergePointArray(rowPoints: Vec2[], colPoints: Vec2[]) {
      let result = rowPoints.concat();
      colPoints = colPoints.filter(function (colEle) {
         let repeat = false;
         result.forEach(function (rowEle) {
            if (colEle.equals(rowEle)) {
               repeat = true
            }
         }, this);
         return !repeat;
      }, this);
      result.push(...colPoints);

      return result;
   }

   checkWithDirection(x: number, y: number, direction: Vec2[]) {
      let vis = new Array(GridWidth * GridHeight).fill(false);
      vis[x + y * GridHeight] = true;
      let queue: Vec2[] = [v2(x, y)];
      let index = 0;
      while (index < queue.length) {
         let point = queue[index];
         let cellModel = this.models[point.x]?.[point.y];
         index++;
         if (!cellModel) {
            continue;
         }
         for (let i = 0; i < direction.length; i++) {
            let tmpX = point.x + direction[i].x;
            let tmpY = point.y + direction[i].y;
            if (isPointOutOfGrid(tmpX, tmpY)
               || vis[tmpX + tmpY * GridHeight]
               || !this.models[tmpX]?.[tmpY]) {
               continue;
            }
            if (cellModel.id === this.models[tmpX][tmpY].id) {
               vis[tmpX + tmpY * GridHeight] = true;
               queue.push(v2(tmpX, tmpY));
            }
         }
      }
      return queue;
   }

   selectSell(pos: Vec3) {
      var lastPos = this.lastPos;
      if(!lastPos){
         this.lastPos = pos;
         return [];
      }
      var delta = Math.abs(pos.x - lastPos.x) + Math.abs(pos.y - lastPos.y);
      if (delta != 1) {
         this.lastPos = pos;
         return [];
      }
      this.swapChess(pos, lastPos);
      let result = this.checkPoint(pos.x, pos.y);
      if (result.type === ChessType.NONE) {
         this.swapChess(pos, lastPos);
         console.log("符合消除回复置");
      } else {
         console.log("符合消除条件", result.flyPoints);
      }
      return [];

   }
   // 交换棋子位置
   swapChess(pos1: Vec3, pos2: Vec3) {
      let temp = this.models[pos1.x][pos1.y];
      this.models[pos1.x][pos1.y].x = pos2.x;
      this.models[pos1.x][pos1.y].y = pos2.y;

      this.models[pos1.x][pos1.y] = this.models[pos2.x][pos2.y];
      this.models[pos2.x][pos2.y] = temp;
      this.models[pos2.x][pos2.y].x = pos1.x;
      this.models[pos2.x][pos2.y].y = pos1.y;
   }

}


