import { _decorator, Component } from 'cc';
import { LayerManager } from './test/LayerManager';
import { TaskMgr, TaskType } from './ToolHelper/TaskMgr';
import { EventMgr } from './test/EventMgr';

export const config = {
  GameList: "GameList",
  SelectColor: "SelectColor",
  HeroTest: "HeroTest",
  ChessBoard: "ChessBoard",
  RedGreenLight: "RedGreenLight",
  GravityRollerCoaster: "GravityRollerCoaster"

}


export const GameConfigData = [
  {
    type: config.SelectColor,
    des: "测试选择颜色",
    data: {
      width: 31, height: 31, SpriteName: "item1", state: true
    }
  },
  {
    type: config.HeroTest,
    des: "测试射击",
    data: {
      SpriteName: "item2", state: false
    }
  },
  {
    type: config.ChessBoard,
    des: "测试消除",
    data: {
      SpriteName: "item3", state: false
    }
  },
  {
    type: config.RedGreenLight,
    des: "测试三色灯",
    data: {
      SpriteName: "item4", state: false
    }
  },
  {
    type: config.GravityRollerCoaster,
    des: "测试过山车",
    data: {
      SpriteName: "item5", state: false
    }
  }
]
export const EventType = {
  GameEnd: "GameEnd",
  MessageInfo: "MessageInfo"
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
    let { page, suc, fail, param } = data;
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

