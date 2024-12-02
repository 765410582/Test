import { _decorator, assetManager, Component, director, instantiate, Label, Prefab, resources, UITransform } from 'cc';
import { InsMgr } from './frame/InsMgr';
import { UIID } from './main/ViewConfig';
import { TempTest } from './main/ToolHelper/TempTest';

export const EventType = {
  GameEnd: "GameEnd",
  MessageInfo: "MessageInfo",
  UpdateTime: "UpdateTime"
}

interface GameData {
  page: string;
  suc?: Function;
  fail?: Function;
  param?: any;
}


export enum NetWorkInfo {
  loginReq,
  loginRes,
}

const { ccclass, property } = _decorator;
@ccclass('TestMain')
export class TestMain extends Component {

  start() {
    InsMgr.net.connect();
    InsMgr.event.on(EventType.GameEnd, this.GameEnd);
    InsMgr.layer.createUILayer(() => {
      InsMgr.layer.show(UIID.Loading);
    });
    InsMgr.time.init();

    let temp_test = new TempTest();
    temp_test.init();

    let dd = ["asdf", "a", "a", "b"].reduce((obj, key) => {
      obj[key] = (obj[key] || 0) + 1;
      return obj;
    }, {})

    let ff = [[11, 33], 22].reduce((obj: any[], key) => obj.concat(key), [])
    console.log("dd", dd, ff);
  
  }

  // 确认结束游戏
  GameEnd(event, data: GameData, status = true) {
    if (!data) return;
    let { page, suc, fail, param } = data;
    if (status) {
      let curLevel = InsMgr.layer.getPreLayer();
      InsMgr.layer.show(curLevel, null, () => {
        InsMgr.layer.hide(parseInt(page.toString()));
      });
      suc && suc(param);
      return;
    }
    if (window.confirm('确定结束游戏吗？')) {
      let curLevel = InsMgr.layer.getPreLayer();
      InsMgr.layer.show(curLevel, null, () => {
        InsMgr.layer.hide(parseInt(page.toString()));
      });
      suc && suc(param);
      return true;
    } else {
      fail && fail()
      return false;
    }
  }
}

