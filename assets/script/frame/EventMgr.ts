import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
type EventCallback<T> = (event: T) => void;
@ccclass('EventMgr')
export class EventMgr extends Component {
    private events: { [key: string]: EventCallback<any>[] } = {};
    private uiMap: { [key: string]: Array<string> } = {};

    /**
     * register event 
     *  eventType:string
     *  callback:Function
     *  target:object
     * */
    on(eventType: string, callback: Function, target = null) {
        if (typeof eventType !== 'string' || eventType === null || eventType === undefined || eventType.trim().length === 0) {
            throw new Error('Invalid event type');
        }
        if (!this.events[eventType]) {
            this.events[eventType] = [];
        }

        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        }
        let boundCallBack = target ? callback.bind(target) : callback
        this.events[eventType] = boundCallBack;
        // add tags
        if (target) {
            let uuid = target.name
            if (!this.uiMap[uuid]) {
                this.uiMap[uuid] = [];
            }
            this.uiMap[uuid].push(eventType);
        }
    }

    /**
     * cancellation event 
     *  eventType:string
     * 
    */
    off<T>(eventType: string): void {
        if (typeof eventType !== 'string' || eventType === null || eventType === undefined || eventType.trim().length === 0) {
            throw new Error('Invalid event type');
        }
        if (!this.events[eventType]) return;
        this.events[eventType] = null;
    }

    /**
     * emit event 
     *  eventType:string
     *  event:object
     * */
    emit<T>(eventType: string, event: T): void {
        if (typeof eventType !== 'string' || eventType === null || eventType === undefined || eventType.trim().length === 0) {
            throw new Error('Invalid event type');
        }
        if (!this.events[eventType]) return;
        let boundCallBack: any = this.events[eventType];
        if (typeof boundCallBack === 'function') {
            boundCallBack(eventType, event);
        }
    }

    /**
     * clear current target event 
     *  target:object
     * evnts:Array
     * 
     * */ 
    Clear(target, events = null) {
        let uuid = target.name
        let curEvent = this.uiMap[uuid];
        if (curEvent) {
            if (events) {// remove array intersections of events
                let set = new Set(events);
                curEvent = curEvent.filter(item => !set.has(item))
            }
            for (let i = 0; i < curEvent.length; i++) {
                this.off(curEvent[i]);
            }
            this.uiMap[uuid] = events;
        }
    }

    /**
     * clear all event
     * */ 
    ALLClear() {
        this.events = {};
        this.uiMap = {};
    }

}


