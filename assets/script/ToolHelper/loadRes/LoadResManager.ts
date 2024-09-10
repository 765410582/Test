import { _decorator, AssetManager, assetManager, Component, Node, SpriteAtlas } from 'cc';
import { Task, TaskBase } from '../TaskMgr';
const { ccclass, property } = _decorator;

@ccclass('LoadResManager')
export class LoadResManager extends Component implements TaskBase {
    private task: Task = null;
    constructor(task: Task) {
        super()
        this.task = task;
    }
    exe() {
        this.handleLoadRes(this.task)
    }


    handleLoadRes(task: Task) {
        let bundleName = task.info.data.bundleName;
        let bundle = assetManager.getBundle(bundleName);
        if (bundle) {
            this.loadResourceData(bundle, task)
        } else {
            this.loadBundleData(bundleName, task);
        }
    }

    loadBundleData(bundleName: string, task: Task) {
        assetManager.loadBundle(bundleName, (err, bundle) => {
            if (err) {
                console.error(arguments);
                return;
            }
            this.loadResourceData(bundle, task);
        });
    }
    loadResourceData(bundle: AssetManager.Bundle | null, task: Task) {
        let paths = task.info.data.paths;
        if (typeof paths === 'string') {
            bundle.loadDir(paths.toString(), SpriteAtlas, this.func.bind(this));
        } else {
            bundle.load(paths, SpriteAtlas, this.func.bind(this));
        }
    }

     func(err, atlas: SpriteAtlas[]) {
        if (err) {
            console.error("err", err);
            return;
        }
        if (atlas) {
            let complete = this.task.complete
            if (typeof complete === 'function') {
                complete(this.task, atlas);
            }
        } else {
            console.error("load res error");
        }
    }
}


