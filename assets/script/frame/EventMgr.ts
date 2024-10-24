import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
type EventCallback<T> = (event: T) => void;
@ccclass('EventMgr')
export class EventMgr extends Component {
    private events: { [key: string]: EventCallback<any>[] } = {};


    on(eventType: string, callback: Function, target = null) {
        if (typeof eventType !== 'string' || eventType === null || eventType === undefined || eventType.trim().length === 0) {
            throw new Error('Invalid event type');
        }
        if (!this.events[eventType]) {
            this.events[eventType] = [];
        }

        if(typeof callback!=='function'){
            throw new Error('callback must be a function');
        }
        let boundCallBack = target ? callback.bind(target) : callback
        this.events[eventType]=boundCallBack;
    }
    off<T>(eventType: string): void {
        if (typeof eventType !== 'string' || eventType === null || eventType === undefined || eventType.trim().length === 0) {
            throw new Error('Invalid event type');
        }
        if (!this.events[eventType]) return;
        this.events[eventType] = null;
    }

    emit<T>(eventType: string, event: T): void {
        if (typeof eventType !== 'string' || eventType === null || eventType === undefined || eventType.trim().length === 0) {
            throw new Error('Invalid event type');
        }
        if (!this.events[eventType]) return;
        let boundCallBack:any= this.events[eventType];
        if(typeof boundCallBack==='function'){
            boundCallBack(eventType,event);
        }
        
    }
}


