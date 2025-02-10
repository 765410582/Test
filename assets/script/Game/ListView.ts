import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('ListView')
export class ListView extends Component {
    @property({tooltip:"垂直显示"})
    vertical:boolean=true;
    @property({tooltip:"水平显示"})
    horizontal:boolean=false;
    @property({tooltip:"预制体",type:Node})
    nodeitem:Node=null;

    @property({tooltip:"数据源"})
    content:Node=null;
    TsScript:string="";
    private data:any;
    setData(data){
        this.data=data;
        for(let i=0;i<data.length;i++){
            let item=this.createItem();
            this.updateData(item,data[i]);
        }
    }

    createItem(){
        if(!this.nodeitem||!this.content)return null;
        let item=instantiate(this.nodeitem);
        item.parent=this.content;
        return item;
    }


    updateData(item,data){
        let temp_ts=item.getComponent(this.TsScript)
        temp_ts.onInit(data,()=>{
            console.log("初始化完成");
        })
    }
    
}



