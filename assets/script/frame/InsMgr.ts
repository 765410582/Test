import { DataDictionary } from "../main/DataDictionary";
import { ToolHelper } from "../main/ToolHelper/ToolHelper";
import { EventMgr } from "./EventMgr";
import { GameTime } from "./GameTime";
import { LayerManager } from "./LayerManager";
import { ResLoadMode } from "./ResLoadMode";
import { TaskManager } from "./TaskManager";


export class InsMgr {
    static layer = new LayerManager();
    static event = new EventMgr();
    static data = new DataDictionary();
    static tool =new ToolHelper();
    static task= new TaskManager();
    static res=new ResLoadMode();
    static time=new GameTime();
}


