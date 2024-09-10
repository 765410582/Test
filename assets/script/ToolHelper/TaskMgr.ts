import { _decorator, AssetManager, assetManager, Component, ConeCollider, FogInfo, Node, SpriteAtlas } from 'cc';
import { DoublyLinkedList } from './DoublyLinkedList';
import { LoadResManager } from './loadRes/LoadResManager';
import { FunExecManager } from './loadRes/FunExecManager';

const { ccclass, property } = _decorator;




export enum TaskType {
    LoadRes = "LoadResManager",//加载资源
    FunExec = "FunExecManager",//执行函数

}

const map = {
    [TaskType.LoadRes]: LoadResManager,
    [TaskType.FunExec]: FunExecManager,
}


export interface TaskBase {
    exe();
}

export interface Task {
    id?: number;
    name: string;
    isComplete?: boolean;
    complete?: Function;
    info?: {
        type: TaskType,
        once?: boolean,
        data?: { bundleName: string, paths: string[] | string }
    };
    resolve?,
    reject?
}
@ccclass('TaskMgr')
export class TaskMgr extends Component {
    private static instance: TaskMgr = null;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new TaskMgr();
        }
        return this.instance;
    }
    private taskList: DoublyLinkedList<Task> = new DoublyLinkedList<Task>();
    private taskIndex: number = 0;
    init() {

    }

    // 添加任务
    addTask(task: Task) {
        console.log("添加任务:", task);
        this.taskList.addItemPos(task);
    }

    // 删除任务
    deleteTask(task: Task, resolve, reject) {
        try {
            this.taskList.deleteItem(task);
            this.nextTask(resolve, reject);
        } catch (e) {
            reject();
            console.error(`删除任务 error:${e}`);
        }

    }

    // 获取任务
    getTask(index: number): Task {
        return this.taskList.getItem(index);
    }

    // 修改任务
    updateTask(index: number, newData: Task) {
        this.taskList.updateItem(index, newData);
    }
    // 获取任务数量
    getTaskCount(): number {
        return this.taskList.length;
    }

    // 开始任务
    startAllTask() {
        this.runningTask().then(() => {
            console.log("running all task finish!!!");
        })
    }

    //================================任务内部方法===================================================

    private async runningTask() {
        await new Promise((resolve, reject) => this.nextTask(resolve, reject))
    }

    private nextTask(resolve1, reject1) {
        let count = this.getTaskCount();
        if (count <= 0) {
            resolve1();
            return;
        }
        let task = this.getTask(this.taskIndex);
        if (!task) {
            console.log(`任务${this.taskIndex}不存在`);
            return;
        }

        let promise = new Promise((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
            this.extentTask(task);
        });
        promise.then((task: Task) => {
            console.log("删除task:", task);
            task.isComplete = true;
            this.deleteTask(task, resolve1, reject1);
        })
    }

    // 执行任务
    private extentTask(task: Task) {
        if (!task || !task.info || typeof task.name !== 'string') {
            const errorMsg = "Invlid task or task info provided."
            console.error(`Task error:${errorMsg}`);
            return task.reject(new Error(errorMsg));
        }
        let type = task.info.type;
        const instance: TaskBase = new map[type](task);
        if (instance) {
            instance.exe();
        }
        let once = task.info.once;
        if (!once) {
            task.resolve(task);
        }
    }


}
