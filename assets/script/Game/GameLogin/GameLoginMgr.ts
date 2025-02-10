import { _decorator, Component, EditBox, Node } from 'cc';
import { BaseUI } from '../../frame/ui/BaseUI';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
const { ccclass, property } = _decorator;

@ccclass('GameLoginMgr')
export class GameLoginMgr extends BaseUI {
    username: EditBox;
    password: EditBox;
    onStart() {
    
    }
    onRegisterUI(): void {
        this.username = this.getNode("UserName", this.node, EditBox)
        this.password = this.getNode("PassWord", this.node, EditBox)
    }

    onRegisterEvent(): void {
        this.getNode("layout/cancel").on('click', () => {
            let data={name:this.username.string,password:this.password.string}
            InsMgr.net.sendRegisterReq(data,() => {
                InsMgr.gameinfo.LoginStatus = true;
                console.log("注册成功");
                InsMgr.layer.hide(UIID.GameLogin);
            });
        }, this);
        this.getNode("layout/confrme").on('click', () => {
            let data={name:this.username.string,password:this.password.string}
            InsMgr.net.sendLoginReq(data,() => {
                InsMgr.gameinfo.LoginStatus = true;
                console.log("登录成功");
                InsMgr.layer.hide(UIID.GameLogin);
            });
        }, this);
        this.getNode("close").on('click', () => {
            InsMgr.layer.hide(UIID.GameLogin);
        }, this);
    }
    unRegister() {

    }
}


