import { _decorator, Asset, assetManager, Component, Label, Node, Prefab, ProgressBar, SpriteFrame, Texture2D } from 'cc';

import { InsMgr } from '../../frame/InsMgr';
import {  UIID } from '../../main/ViewConfig';

import { l10n } from 'db://localization-editor/l10n'
import { BaseUI } from '../../frame/ui/BaseUI';
const loadData = [
    { path: "prefab", type: Prefab, dec: "预制体", handle: "bundleA" }, 
    { path: "ui", type: SpriteFrame, dec: "精灵贴图", handle: "bundleA" }, 
    { path: "tex", type: Texture2D, dec: "图片原始数据", handle: "bundleA" }
];
const { ccclass, property } = _decorator;
@ccclass('LoadingMgr')
export class LoadingMgr extends BaseUI {
    
    private _progress: number;
    private progressBar: ProgressBar;
    private barLabel: Label;
    private index: number = 1;
    totalTime: number;
    startTime: number = performance.now(); // 记录开始时间

    onRegisterUI(): void {
        this.progressBar = this.getNode("ProgressBar",null,ProgressBar);
        this.barLabel = this.getNode("barLabel",null,Label);
    }

    onStart():void{
        InsMgr.layer.show(UIID.NetLoading);
        this.loading();
    }
       
    async loading() {
        loadData.forEach(async element => {
            await InsMgr.task.add(element.path, 1, async (t, progressCallback) => {
                return await new Promise(resolve => {
                    this.loadBundleData(element, progressCallback, resolve);
                })
            });
        });
        InsMgr.task.runSerial((p) => {
            this.progress = p;
        }, this);
    }

    private login() {
        // InsMgr.data.print();
        InsMgr.layer.show(UIID.GameList, null, () => {
            InsMgr.layer.hide(UIID.Loading);
            InsMgr.layer.hide(UIID.NetLoading);
        });
    }

    get progress() {
        return this._progress;
    }

    set progress(v) {
        this._progress = v;
        this.progressBar.progress = this._progress;
        const elapsedTime = performance.now() - this.startTime; // 计算已耗时间
        if (v > 0) {
            this.totalTime = elapsedTime / v; // 估算总时间
        }
        const remainingTime = this.totalTime - elapsedTime; // 计算剩余时间
        let time = l10n.t("needtime").replace("${0}", remainingTime.toFixed(0));
        this.barLabel.string =l10n.t("loading") +Math.floor(this._progress * 100) + "%"+"\r\n\r\n"+time;
    }

    // 处理加载数据
    loadBundleData(element, progressCallback, resolve) {
        InsMgr.res.loadBundles(element, (finish, total) => {
            let progressNum = (finish / total) * (this.index / loadData.length)
            progressCallback(progressNum)
        }, (assets) => {
            for (let i = 0; i < assets.length; i++) {
                if (element.type == Prefab) {
                    InsMgr.data.setData(assets[i].name, assets[i], element.dec);
                } else {
                    let key = element.path + i
                    InsMgr.data.setData(key, assets[i], element.dec);
                }
            }
            resolve(true);
            if (this.index == loadData.length) {
                progressCallback(1);
                this.login();
            } else {
                this.index++;
            }
        })
    }

    unRegister() {
        
    }
}


