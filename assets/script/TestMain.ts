import { _decorator, assetManager, Component, director, instantiate, Label, Prefab, resources, UITransform } from 'cc';
import { NextLayer } from './frame/LayerManager';
import { InsMgr } from './frame/InsMgr';
import { UIID } from './main/ViewConfig';
import { LoadingMgr } from './Game/Loading/LoadingMgr';

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


const { ccclass, property } = _decorator;
@ccclass('TestMain')
export class TestMain extends Component {

  start() {
    InsMgr.event.on(EventType.GameEnd, this.GameEnd);
    InsMgr.layer.createUILayer(() => {
      InsMgr.layer.show(UIID.Loading);
    });
    InsMgr.time.init();
  }

  // 确认结束游戏
  GameEnd(event ,data: GameData, status = true) {
    if (!data) return;
    let { page, suc, fail, param } = data;
    if (status) {
      let curLevel = InsMgr.layer.getPreLayer();
      InsMgr.layer.show(curLevel, null, () => {
        InsMgr.layer.hide(page);
      });
      suc && suc(param);
      return;
    }
    if (window.confirm('确定结束游戏吗？')) {
      let curLevel = InsMgr.layer.getPreLayer();
      InsMgr.layer.show(curLevel, null, () => {
        InsMgr.layer.hide(page);
      });
      suc && suc(param);
      return true;
    } else {
      fail && fail()
      return false;
    }
  }
}

