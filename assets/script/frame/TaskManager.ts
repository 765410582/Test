export type Progressor = (p: number) => void;
export type Runner = (task: Task, progress: Progressor) => Promise<boolean>;

export class Task {
    name: string;
    weight: number;
    runner: Runner;

    constructor(name: string, weight: number, runner: Runner) {
        this.name = name;
        this.weight = weight;
        this.runner = runner;
    }
}

export class TaskManager {
    private _tasks: Task[] = [];
    private _totalWeight: number = 0;

    add(name: string, weight: number, runnder: Runner) {
        this._tasks.push(new Task(name, weight, runnder));
        this._totalWeight += weight;
    }

    async runSerial(progress: Progressor, thisObj: any) {      
        var weight = 0;   
        let totalTime = Date.now();
        progress?.call(thisObj, 0);        
        for (let task of this._tasks) {
            console.log(`begin task ${task.name}`);
            let dt = Date.now();
            let ret = await task.runner(task, (p) => {
                let w = weight + task.weight * p;
                let pp = w / this._totalWeight;
                progress?.call(thisObj, pp);
            });
            
            if (!ret) {
                return false;
            }

            weight += task.weight;
            let pp = weight / this._totalWeight;
            progress?.call(thisObj, pp);

            console.log(`task ${task.name} done, cost ${Date.now() - dt}ms`);
        }
        console.log(`total cost ${Date.now() - totalTime}ms`);
        return true;
    }

    async runParallel(progress: Progressor, thisObj: any) {  
        var weight = 0; 
        let tasks = this._tasks.map(task => {
            return new Promise(async (resolve, reject) => {
                console.log(`begin task ${task.name}`);
                let dt = Date.now();
                let ret = await task.runner(task, (p) => {
                    let w = weight + task.weight * p;
                    let pp = w / this._totalWeight;
                    progress?.call(thisObj, pp);
                });
                weight += task.weight;
                console.log(`task ${task.name} done, cost ${Date.now() - dt}ms`);              
                let pp = weight / this._totalWeight;
                progress?.call(thisObj, pp);

                resolve(ret);
            });
        });

        let totalTime = Date.now();
        let ret = await Promise.all(tasks);
        console.log(`total cost ${Date.now() - totalTime}ms`);

        if (ret.indexOf(false) >= 0) {
            return false;
        }
        return true;
    }
}