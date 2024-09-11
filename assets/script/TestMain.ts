import { _decorator, Component, ImageAsset, resources, SpriteFrame, Texture2D, UITransform } from 'cc';
import { LayerManager } from './test/LayerManager';
import { TaskMgr, TaskType } from './ToolHelper/TaskMgr';
import { EventMgr } from './test/EventMgr';

export const config = {
  GameList: "GameList",
  SelectColor: "SelectColor",
  HeroTest: "HeroTest",
  ChessBoard: "ChessBoard",
  RedGreenLight:"RedGreenLight"
}
export const EventType = {
  GameEnd: "GameEnd",
  MessageInfo:"MessageInfo"
}

interface GameData {
  page: string;
  suc?: Function;
  fail?: Function;
  param?: any;
}
const { ccclass, property } = _decorator;
@ccclass('TestMain')
export class TestMain extends Component {
  start() {
    LayerManager.Instance.show(config.GameList);
    TaskMgr.getInstance().addTask({ info: { type: TaskType.LoadRes }, name: "", complete: () => { } });
    EventMgr.Instance.register(EventType.GameEnd, this.GameEnd);
  }

  // 确认结束游戏
  GameEnd(data: GameData) {
    if (!data) return;
    let { page, suc, fail ,param} = data;
    if (window.confirm('确定结束游戏吗？')) {
      LayerManager.Instance.show(config.GameList, null, () => {
        LayerManager.Instance.remove(page);
      });
      suc && suc(param);
      return true;
    } else {
      fail && fail()
      return false;
    }
  }

  
}

