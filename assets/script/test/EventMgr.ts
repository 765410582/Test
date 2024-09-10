import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EventMgr')
export class EventMgr extends Component {
    private static _instance: EventMgr = null;
    private map: Map<string, Function> = new Map();
    static get Instance(): EventMgr {
        if (!this._instance) {
            this._instance = new EventMgr();
        }
        return this._instance;
    }

    register(eventName: string, callback: Function) {
        if (this.map.has(eventName)) {
            return;
        }
        this.map.set(eventName, callback);
    }
    unregister(eventName: string) {
        if (!this.map.has(eventName)) {
            return;
        }
        this.map.delete(eventName);
    }
    displayer(eventName: string, ...args) {
        let callback = this.map.get(eventName);
        if (callback) {
            callback(...args);
        }
    }
}


