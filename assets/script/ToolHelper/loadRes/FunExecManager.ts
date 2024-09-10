import { _decorator, Component, Node } from 'cc';
import { Task, TaskBase } from '../TaskMgr';
const { ccclass, property } = _decorator;

@ccclass('FunExecManager')
export class FunExecManager extends Component implements TaskBase {
    task: Task;
    constructor(task: Task) {
        super()
        this.task = task;
    }
    exe() {
        this.handleFunExec(this.task);
    }
    handleFunExec(task: Task) {
        let complete = task.complete
        if (typeof complete === 'function') {
            complete(task);
        }
    }
}


