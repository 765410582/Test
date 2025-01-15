import { _decorator, assetManager, Component, director, instantiate, Label, Prefab, resources, UITransform } from 'cc';
import { InsMgr } from './frame/InsMgr';
import { UIID } from './main/ViewConfig';
import { TempTest } from './main/ToolHelper/TempTest';

export const EventType = {
  GameEnd: "GameEnd",
  MessageInfo: "MessageInfo",
  UpdateTime: "UpdateTime",
  TetrisMgr:"TetrisMgr"
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
    
    InsMgr.event.on(EventType.GameEnd, this.GameEnd);
    
    InsMgr.time.init();
    InsMgr.layer.createUILayer();
    let StartGame=this.node.getChildByPath("StartGame")
    let StartGame_Btn=this.node.getChildByPath("StartGame/Button")
    StartGame_Btn.on('click',()=>{
      StartGame.active=false;
      InsMgr.layer.show(UIID.Loading);
    })

    let result=InsMgr.tool.getTimeFormat(0,"HH:mm:ss YYYY-MM-dd ");
    console.log("result: ",result);
  }

  // 确认结束游戏
  GameEnd(event, data: GameData, status = false) {
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

