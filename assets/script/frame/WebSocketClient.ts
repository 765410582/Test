import { _decorator, Component, director, Label, Node } from 'cc';
import { InsMgr } from './InsMgr';
import { Code, StatusEnum } from '../TestMain';
import { GameInfo } from '../GameInfo';
const { ccclass, property } = _decorator;

@ccclass('WebSocketClient')
export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectInterval: number;
    private maxReconnectAttempts: number;
    private reconnectAttempts: number = 0;
    public backCall: Function = null;
    public reqMap = new Map();

    constructor(url: string, reconnectInterval = 5000, maxReconnectAttempts = 10) {
        this.url = url;
        this.reconnectInterval = reconnectInterval;
        this.maxReconnectAttempts = maxReconnectAttempts;
    }

    // 初始化 WebSocket 连接
    public connect() {
        if (this.ws) {
            console.warn("WebSocket is already connected.");
            return;
        }

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("Connected to WebSocket server.");
            console.log("已经建立连接");
            this.reconnectAttempts = 0;
           
        };

        this.ws.onmessage = (event: MessageEvent) => {
            this.onMessage(event.data);
        };

        this.ws.onclose = (event: CloseEvent) => {
            console.log("WebSocket connection closed.", event);
            this.ws = null;
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.reconnect(), this.reconnectInterval);
            }
        };

        this.ws.onerror = (error: Event) => {
            console.error("WebSocket encountered an error:", error);
        };
    }



    // 重连方法
    private reconnect() {
        console.log(`Reconnecting... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts += 1;
        this.connect();
    }

    // 发送消息
    public sendMessage(message: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.warn("WebSocket is not open. Unable to send message.");
        }
    }

    // 关闭 WebSocket 连接
    public close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    // 接收消息处理
    protected onMessage(data: string) {

        let tdata = JSON.parse(data);
        console.log("接受消息", tdata);
        if (tdata.Status != 0) {
            this.dataError(tdata);
            return;
        }
        let result = this.reqMap.has(tdata.Code);
        if (result) {
            let tcall = this.reqMap.get(tdata.Code);
            if (typeof tcall == "function") {
                tcall(tdata);
            }
        }

        console.log("Received message:", data);
    }


    dataError(err) {
        console.error("WebSocket error:", err);
        switch (err.Status) {
            case StatusEnum.LoginFail:
                console.error("登录失败");
                alert("登录失败");
                break;
            default:
                console.error("未知错误");
        }
    }

    // 是否连接
    /**
     * name
     */
    public isConnect() {
        let result = false;
        if (this.ws.readyState === WebSocket.CONNECTING) {
            console.log("WebSocket 正在连接...");
        } else if (this.ws.readyState === WebSocket.OPEN) {
            console.log("WebSocket 已连接.");
            result = true;
        } else if (this.ws.readyState === WebSocket.CLOSING) {
            console.log("WebSocket 正在关闭...");
        } else if (this.ws.readyState === WebSocket.CLOSED) {
            console.log("WebSocket 已关闭.");
        }
        return result;
    }
    //================================================================================
    // 注册
    sendRegisterReq(data,backCall) {
        InsMgr.net.sendMessage(JSON.stringify( Object.assign({ Code: Code.regiterReq }, data)))
        this.reqMap.set(Code.regiterRes,backCall);
    }
    //登录 
    sendLoginReq(data,backCall) {
        // let userinfo: object = InsMgr.data.getData("UserInfo");
        // if (!userinfo) {
        //     let username = InsMgr.tool.generateUniqueUsername('user_', 8);
        //     userinfo = { name: username, password: "123456" };
        //     InsMgr.data.setData("UserInfo", userinfo);
        // }
        
        InsMgr.net.sendMessage(JSON.stringify( Object.assign({ Code: Code.loginReq }, data)))
        this.reqMap.set(Code.loginRes,backCall);
    }

    // 发送匹配
    sendTetrisReq(backCall) {
        let data = { Code: Code.TetrisReq }
        this.ws.send(JSON.stringify(data));
        this.reqMap.set(Code.TetrisRes, backCall);
    }

    // 退出围棋
    sendSelfTetrisExitReq(backCall = null) {
        let data = { Code: Code.ExitTetrisReq }
        this.ws.send(JSON.stringify(data));
        this.reqMap.set(Code.ExitTetrisRes, backCall);
    }

    //接受围棋结果处理
    sendTetrisExitReq(backCall) {
        this.reqMap.set(Code.TetrisMessage, backCall);
    }

    // 发送DeepSeek 查询
    sendDeepSeekReq(message,backCall) {
        let data = { Code: Code.DeepseekReq,Data:message }
        this.ws.send(JSON.stringify(data));
        this.reqMap.set(Code.DeepseekRes, backCall);
    }


}