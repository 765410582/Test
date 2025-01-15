import { _decorator, Component, instantiate, Label, Node, ScrollView, Sprite, v2 } from 'cc';
import { BaseUI } from '../../frame/ui/BaseUI';
import { InsMgr } from '../../frame/InsMgr';
import { UIID } from '../../main/ViewConfig';
const { ccclass, property } = _decorator;


let ColorData=[
    {
        index:0,
        size:v2(15, 15),
        des:"这是一个人物"
    },
    {
        index:1,
        size:v2(15, 15),
        des:"这是一个笑脸"
    },
    {
        index:2,
        size:v2(15, 15),
        des:"这是一个对话"
    },
    {
        index:3,
        size:v2(15, 15),
        des:"这是一个狗头"
    }
]
@ccclass('ColorListMgr')
export class ColorListMgr extends BaseUI {
    private content: Node;
    item: any;
    onStart() {
        const Index = 0
        
        for (let i = 0; i < ColorData.length; i++) {
            this.getItem(ColorData[i])
        }
    }


    getItem(data) {
        let node = instantiate(this.item);
        node.parent = this.content;
        node.tag=data.index;
        node.on('click',(btn)=>{
            let tag=btn.node.tag;
            InsMgr.layer.show(UIID.SelectColor, ColorData[tag], () => {
                InsMgr.layer.hide(UIID.ColorList);
            });
        },this)
        this.getNode("decLabel",node,Label).string = data.des;
        let { value } = InsMgr.data.getData("ui"+data.index);
        let test = this.getNode("icon", node, Sprite)
        test.spriteFrame = value;
    }


    onRegisterUI(): void {
        this.content = this.getNode("ScrollView", this.node, ScrollView).content;
        this.item = this.getNode("item")
        this.getNode("reBtn").on('click',()=>{
            InsMgr.layer.show(UIID.GameList, null, () => {
                InsMgr.layer.hide(UIID.ColorList);
            });
        },this);
    }
    unRegister() {
    }

}


