
import { DataDictionary } from "../main/DataDictionary";
import { ToolHelper } from "../main/ToolHelper/ToolHelper";
import { EventMgr } from "./EventMgr";
import { GameTime } from "./GameTime";
import { LayerManager } from "./LayerManager";
import { ResLoadMode } from "./ResLoadMode";
import { TaskManager } from "./TaskManager";
import { WebSocketClient } from "./WebSocketClient";
const url="ws://127.16.24.228:3000"
// const url="ws://26.26.26.1:3000"

export class InsMgr {
    static layer = new LayerManager();
    static event = new EventMgr();
    static data = new DataDictionary();
    static tool =new ToolHelper();
    static task= new TaskManager();
    static res=new ResLoadMode();
    static time=new GameTime();
    static net=new WebSocketClient(url);
}


