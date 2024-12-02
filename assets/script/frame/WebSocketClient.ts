import { _decorator, Component, director, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WebSocketClient')
export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectInterval: number;
    private maxReconnectAttempts: number;
    private reconnectAttempts: number = 0;

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
        // console.log("Received message:", data);
    }
}


