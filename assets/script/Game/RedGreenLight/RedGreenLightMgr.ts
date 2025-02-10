import { _decorator, Color, Component, EditBox, Label, Node, RichText, ScrollView, Sprite } from 'cc';
import { TrafficLight } from './TrafficLight';
import { InsMgr } from '../../frame/InsMgr';
import { BaseUI } from '../../frame/ui/BaseUI';


const { ccclass, property } = _decorator;

@ccclass('RedGreenLightMgr')
export class RedGreenLightMgr extends BaseUI {
    editBox: EditBox;
    submit: Node;
    richText: RichText;
    tempCount: number;
    deepSeekArray: Array<Object> = [];
    callback: Function;
    index: number = 0;
    onStart() {
    }


    onRegisterUI(): void {
        this.editBox = this.getNode("EditBox", this.node, EditBox)
        this.richText = this.getNode("ScrollView/view/content/RichText", this.node, RichText);
    }

    onRegisterEvent(): void {
        InsMgr.tool.reBtnCall(this.getNode("reBtn"), () => {
            console.log("退出成功");
        });
        this.getNode("Submit").on("click", () => {
            let str = this.editBox.string;
            this.typeWriter(this.richText, str, 20, true);
            this.deepSeekArray.push(str);
            this.find(str);
        })
    }


    find(str) {
        InsMgr.net.sendDeepSeekReq(str, (message) => {
            let { Data } = message;
            this.deepSeekArray.push(Data);
            console.log("Data");
            // this.typeWriter(this.richText, Data, 100);
            if (this.deepSeekArray.length <= 100) {
                const tempStr = "刚才小说第" + this.index++ + "章"
                this.find(tempStr);
            }
        })
    }
    typeWriter(richText: RichText, message: string, speed: number, temp: boolean = false) {
        // let i = 0;
        // if (!richText) return;
        // let repalce = "\r\n"
        // richText.string += repalce;
        // const interval = setInterval(() => {
        //     richText.string += message[i];
        //     i++;
        //     if (i === message.length) {
        //         clearInterval(interval);//清除定时器，结束打字滚动
        //     }
        // }, speed)
        if (this.deepSeekArray.length > 1) {
            let repalce = "\r\n"
            richText.string += repalce;
        }
        richText.string += message.toString();
    }
    unRegister() {

    }


}


