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




export const Code={
  // 登录消息
  regiterReq:101,
  regiterRes:102,
  loginReq: 103,
  loginRes: 104,

  // 棋盘消息
  TetrisReq: 201,
  TetrisRes: 202,
  ExitTetrisReq: 203,
  ExitTetrisRes: 204,
  // 主动发送消息
  TetrisMessage: 301,

  DeepseekReq: 401,
  DeepseekRes: 402,
}
export const StatusEnum = {
  LoginFail: 1,
}

const { ccclass, property } = _decorator;
@ccclass('TestMain')
export class TestMain extends Component {

  start() {
    
    InsMgr.event.on(EventType.GameEnd, this.GameEnd);
    InsMgr.net.connect();
    InsMgr.time.init();
    InsMgr.layer.createUILayer();
    let StartGame=this.node.getChildByPath("StartGame")
    let StartGame_Btn=this.node.getChildByPath("StartGame/Button")
    StartGame_Btn.on('click',()=>{
      if(!InsMgr.net.isConnect()){
        alert("请先连接服务器")
        return;
      }
      if(!InsMgr.gameinfo.LoginStatus){
        InsMgr.layer.show(UIID.GameLogin);
        return;
      }
      StartGame.active=false;
      InsMgr.layer.show(UIID.Loading);
    })
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

