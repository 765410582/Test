import { _decorator, Component, Node } from 'cc';
import { InsMgr } from './frame/InsMgr';
import { UIID } from './main/ViewConfig';
import { EventType } from './TestMain';
const { ccclass, property } = _decorator;

 enum GameStatus {
   None = -1,
   GAME_START = 1,
   GAME_PAUSE = 2,
}

 enum GameResult {
   None = -1,
   GAME_WIN = 1,
   GAME_LOSE = 2,
}

export interface GameData {
   name:string;
   time: number;
   data: any;
}


@ccclass('GameInfo')
export class GameInfo {

   private gameStatus: GameStatus= GameStatus.None;
   private gameResult:GameResult=GameResult.None;
   private gameData:GameData=null;


   private totalJSHeapSize:any;
   private usedJSHeapSize:any;
   private jsHeapSizeLimit:any;

   public isPause():boolean {
      return this.gameStatus==GameStatus.GAME_PAUSE;
   }
   public getResult() {
      return this.gameResult;
   }
   public startGame() {
      this.gameStatus = GameStatus.GAME_START;
      const memoryInfo = performance["memory"];
      if (memoryInfo) {
         this.totalJSHeapSize=memoryInfo.totalJSHeapSize;
         this.usedJSHeapSize=memoryInfo.usedJSHeapSize;
         this.jsHeapSizeLimit=memoryInfo.jsHeapSizeLimit;
         console.log("分配给 JS 堆的总内存:", this.totalJSHeapSize, "bytes");
         console.log("已使用的 JS 堆内存:", this.usedJSHeapSize, "bytes");
         console.log("JS 堆的内存上限:", this.jsHeapSizeLimit, "bytes");
       } else {
         console.log("The `performance.memory` API is not supported in this browser.");
       }
   }

   public pauseGame() {
      this.gameStatus = GameStatus.GAME_PAUSE;
   }

   public winGame() {
      this.gameResult = GameResult.GAME_WIN;
   }

   public setData(data:GameData) {
      this.gameData = data;
   }

   public getData():GameData {
      return this.gameData;
   }

   public loseGame() {

     
      this.gameResult = GameResult.GAME_LOSE;
      let tdata = {
         title: "游戏失败",
         isConfire: true,
         isCancel: false,
         confireCb: () => {
            this.exitGame(()=>{
               const memoryInfo = performance["memory"];
               if (memoryInfo) {
                  this.totalJSHeapSize-=memoryInfo.totalJSHeapSize;
                  this.usedJSHeapSize-=memoryInfo.usedJSHeapSize;
                  this.jsHeapSizeLimit-=memoryInfo.jsHeapSizeLimit;
                  console.log("游戏失败-分配给 JS 堆的总内存:", this.totalJSHeapSize, "bytes");
                  console.log("游戏失败-已使用的 JS 堆内存:", this.usedJSHeapSize, "bytes");
                  console.log("游戏失败-JS 堆的内存上限:", this.jsHeapSizeLimit, "bytes");
               }
               
            })
         },
         text: "确定退出游戏？",
     }
     InsMgr.layer.show(UIID.GamePopup, tdata);
   }

   public exitGame(cb=null) {
      InsMgr.event.emit(EventType.GameEnd, {
         page: InsMgr.layer.getCurLevel(),
         suc: () => {
             cb && cb();
         }
     });
   }
}

