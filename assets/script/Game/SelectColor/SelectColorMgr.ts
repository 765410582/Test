import { _decorator, assetManager, Color, Component, EventTouch, Graphics, instantiate, Label, Layers, Layout, Node, ProgressBar, ScrollView, size, Size, Slider, Sprite, SpriteFrame, sys, Texture2D, UIOpacity, UITransform, v2, v3, Vec3 } from 'cc';
import { EventMgr } from '../../frame/EventMgr';

import { UIConfigData, UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';
import { BaseUI } from '../../frame/ui/BaseUI';
import { Graphics_Write } from './Graphics_Write';

const { ccclass, property } = _decorator;
export enum SaveStatus {
    DEFALUT = -1,//-1未开始 
    UNFINISH = 0,//0:未完成
    FINISH = 1// 1:已完成 
}
// const Index=0
// const SIZE=[v2(15,15),v2(15,15)]
export let FIX_ITEM_WIDTH =15;
export let FIX_ITEM_HEIGHT =15;
@ccclass('SelectColorMgr')
export class SelectColorMgr extends BaseUI {
    alone: number = 0;
    colors = [];
    targetColors = [];
    baseColor = [];
    baseColorMap = new Map();
    colorLabel = [];
    colorDataLabel = [];
    target: Sprite = null;
    selectIndex: number = 0;
    countLabel: Label = null;
    count: number = 0;
    colorsNode: Node;
    selctBox: Node;
    objdata: any;
    textures = []
    scaleNum: number = 1;
    slider: Slider;
    sliderLabel: Label;
    root: Node;
    startPositon: Vec3 = null;
    fixPosition: Vec3 = null;
    nIntervId = null;
    contentSize: Readonly<Size>;
    tempColorList: any[];

    graphics_Write: Graphics_Write = null;
    writeCount:number=0;
    onStart() {
       
        this.objdata = { spriteItem: null, index: 0 };
        let {index,size,Des}=this.data;
        FIX_ITEM_WIDTH =size.x;
        FIX_ITEM_HEIGHT =size.y;
        let { value } = InsMgr.data.getData("ui"+index);
        let test = this.getNode("test", this.node, Sprite)
        test.spriteFrame = value;
        this.objdata.spriteItem = test.spriteFrame;
        this.initColorData();
        this.addColors()
        this.updateColor();
        this.updateShowColors();
        this.loadLabelData();
    }


    /**
     * 初始化颜色数据模块。
     * 此方法用于设置颜色选择区域的各种组件和交互逻辑。
     * 它首先从节点中获取颜色选择区域的子节点，然后设置选择框的大小和位置，
     * 并监听触摸事件以处理颜色选择交互。
     */
    initColorData() {
        this.colorsNode = this.getNode("colors")
        this.selctBox = this.getNode("select", this.colorsNode.getComponent(ScrollView).content);
        this.selctBox.getComponent(UITransform).priority = 1;
        this.countLabel = this.getNode("countLabel", this.colorsNode, Label);
        this.target = this.getNode("target", this.node, Sprite);
        this.slider = this.getNode("Slider", this.node, Slider);
        this.sliderLabel = this.getNode("Label", this.slider.node, Label);
        this.root = this.getNode("target/root");
        // 像素块颜色设置
        this.contentSize = this.target.node.getComponent(UITransform).contentSize;
        this.alone = this.contentSize.width / FIX_ITEM_WIDTH;


        let worldPos = this.target.node.getWorldPosition();
        let zeroPos = v3(worldPos.x - this.contentSize.width / 2, worldPos.y - this.contentSize.height / 2, worldPos.z);
        let maxPos = v3(worldPos.x + this.contentSize.width / 2, worldPos.y + this.contentSize.height / 2, worldPos.z);

        this.fixPosition = worldPos;
        this.target.node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            let uiLocation = event.getUILocation();
            worldPos = this.target.node.getWorldPosition();
            this.startPositon = v3(uiLocation.x, uiLocation.y, 0)
            zeroPos = v3(worldPos.x - this.contentSize.width / 2 * this.scaleNum, worldPos.y - this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            maxPos = v3(worldPos.x + this.contentSize.width / 2 * this.scaleNum, worldPos.y + this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            this.clickColor(event, zeroPos, maxPos);
        }, this);
        this.target.node.on(Node.EventType.TOUCH_MOVE, (event) => {
            worldPos = this.target.node.getWorldPosition();
            zeroPos = v3(worldPos.x - this.contentSize.width / 2 * this.scaleNum, worldPos.y - this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            maxPos = v3(worldPos.x + this.contentSize.width / 2 * this.scaleNum, worldPos.y + this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            this.clickColor(event, zeroPos, maxPos);
        }, this);

        this.target.node.on(Node.EventType.TOUCH_END, (event) => {
            
        }, this);
        this.target.node.on(Node.EventType.TOUCH_CANCEL, (event) => {
          
        }, this);

        InsMgr.tool.reBtnCall(this.getNode("reBtn"), () => {
            this.saveData()
            if (this.target) {
                this.target.node.destroy();
            }
        });
        this.slider!.node.on('slide', this.callback, this);

        this.getNode("btn_auto").on('click', () => {
            this.autoStroke();
        })
    }

    /**
  * 处理点击颜色选择事件，检查点击位置是否在指定区域内，并与当前选中的颜色进行比较。
  *
  * @param event {TouchEvent} 触摸事件对象，包含触摸位置信息。
  * @param zeroPos {Vec2} 区域左上角坐标。
  * @param maxPos {Vec2} 区域右下角坐标。
  *
  * @internal
  */
    clickColor(event, zeroPos, maxPos) {
        if (this.count <= 0) return;
        let uiLocation = event.getUILocation();
        if (uiLocation.x >= zeroPos.x && uiLocation.y >= zeroPos.y && uiLocation.x <= maxPos.x && uiLocation.y <= maxPos.y) {
            let x = Math.floor((uiLocation.x - zeroPos.x) / (this.alone * this.scaleNum));
            let y = Math.floor((uiLocation.y - zeroPos.y) / (this.alone * this.scaleNum));

            let selectColor = this.baseColor[this.selectIndex];
            let x_1 = FIX_ITEM_WIDTH - 1 - y
            let y_1 = x;
            let result = x_1 >= 0 && y_1 >= 0 && x_1 < this.colors.length && y_1 < this.colors[x_1].length;
            if (!result) {
                return;
            }
            let confrim = this.colors[x_1][y_1];
            if (selectColor._val == confrim._val) {
                if (this.targetColors[x_1][y_1]._val != confrim._val) {
                    this.count--
                    this.countLabel.string = `当前选项个数：${this.writeCount}\r\n`+`剩余个数：${this.count}`;
                    this.targetColors[x_1][y_1] = confrim;
                    if (this.colorLabel[x_1][y_1]) {
                        this.colorLabel[x_1][y_1].destroy();
                        this.colorLabel[x_1][y_1] = null;
                    }
                    this.writeBox();
                    this.updateColor();
                } else {
                    if (this.colorLabel[x_1][y_1]) {
                        this.colorLabel[x_1][y_1].destroy();
                        this.colorLabel[x_1][y_1] = null;
                        this.count--
                        this.countLabel.string = `当前选项个数：${this.writeCount}\r\n`+`剩余个数：${this.count}`;
                        this.writeBox();
                    }
                }
              
            } else {
                console.error("请选择正确的颜色");
            }
        }
        this.saveData()
    }
    /**
    * 更新颜色信息。
    * 此方法通过获取当前图像的像素数据，然后使用ToolHelper的函数将这些数据转换为精灵对象的颜色表现形式。
    * 这一过程对于处理图像颜色变化或应用颜色过滤等操作是非常关键的。
    */
    updateColor() {
        const data = this.getPixelData();
        InsMgr.tool.pixelsToSprite(this.target, data);
    }


    /**
     * 初始化颜色信息。
     * 该方法用于根据图像像素数据，初始化颜色数组及相关属性，为后续处理和显示图像做准备。
     * 这里主要处理的是将像素数据映射到固定尺寸的颜色数组中，并计算出对应的颜色标签。
     */
    addColors() {
        // 读取数据/本地/服务器
        let color_data = InsMgr.data.getData("selectColor");
        let { state, value } = { state: SaveStatus.UNFINISH, value: null };
        // if (color_data) {
        //     [state, value] = [color_data.state, color_data.value];
        // }
        this.colors = [];
        this.targetColors = [];
        this.colorLabel = [];

        let [pixels, baseColor, baseColorMap] = InsMgr.tool.getLoadPixels(this.objdata.spriteItem, FIX_ITEM_WIDTH, FIX_ITEM_HEIGHT);
        [this.baseColor, this.baseColorMap] = [baseColor, baseColorMap];
        let minx = Math.floor((FIX_ITEM_WIDTH - pixels.length) / 2)
        let miny = Math.floor((FIX_ITEM_HEIGHT - pixels[0].length) / 2)
        let index = 0;
        let finishCount = 0;
        // 添加颜色集合
        for (let t = 0; t < FIX_ITEM_WIDTH; t++) {
            this.colors[t] = [];
            this.targetColors[t] = [];
            this.colorLabel[t] = [];
            for (let t1 = 0, t2 = FIX_ITEM_HEIGHT - 1; t1 < FIX_ITEM_HEIGHT; t1++, t2--) {
                let color = null;
                if (t >= minx && t1 >= miny && pixels.length > (t - minx) && pixels[t - minx].length > (t1 - miny)) {
                    color = pixels[t - minx][t1 - miny];
                    index = this.baseColorMap.get(color._val);
                    if (color._val == 0) {
                        color = this.baseColor[0];
                        index = 0;
                    }
                } else {
                    color = this.baseColor[0];
                    index = 0;
                }
                this.colors[t][t1] = color;
                let gray = InsMgr.tool.rgbToBlackAndWhite(color);
                let color2 = new Color(gray, gray, gray, 255);
                let obj = null;
                if (state === SaveStatus.FINISH || state !== SaveStatus.DEFALUT && value && value[t][t1]) {
                    this.targetColors[t][t1] = color;
                    finishCount++;
                    obj = {
                        t: t,
                        t1: t1,
                        pos: null,
                        index: null
                    }
                } else {
                    this.targetColors[t][t1] = color2;
                    obj = {
                        t: t,
                        t1: t1,
                        pos: v3(0.5 - FIX_ITEM_HEIGHT / 2 + t1, (FIX_ITEM_HEIGHT / 2 - 0.5 - t), 0),
                        index: index + 1
                    }
                }
                this.colorDataLabel.push(obj)
            }
        }
        this.count = FIX_ITEM_HEIGHT * FIX_ITEM_HEIGHT - finishCount;
        this.countLabel.string = `当前选项个数：${this.writeCount}\r\n`+`剩余个数：${this.count}`;
    }


    /**
        * 获取像素数据。
        * 
        * 该方法用于根据当前内容尺寸和指定的颜色方案，生成一个Uint8Array类型的像素数据。
        * 像素数据的排列顺序为RGBA，每个像素的颜色值由其在内容中的位置和目标颜色数组确定。
        * 
        * @returns {any} 返回一个Uint8Array类型的数组，包含所有像素的颜色数据。
        */
    getPixelData(): any {
        let width = this.contentSize.width, height = this.contentSize.height;
        const data = new Uint8Array(width * height * 4);    // rgba
        for (let n = 0, i = 0; n < width; n++) {
            for (let m = 0; m < height; m++, i += 4) {
                let centerN = Math.floor(n / this.alone);
                let centerM = Math.floor(m / this.alone);
                let color = this.targetColors[centerN][centerM];
                data[i] = color.r;
                data[i + 1] = color.g;
                data[i + 2] = color.b;
                data[i + 3] = color.a;
            }
        }
        return data;
    }

    /**
 * 根据给定的位置和值创建并返回一个带有标签的节点。
 * 
 * 此函数用于生成一个新的节点，该节点包含一个标签组件，标签上显示指定的文本值。
 * 它通过克隆一个预定义的节点模板来创建新节点，并根据提供的位置和值来配置新节点。
 * 
 * @param position 节点的位置，用于确定新节点在场景中的位置。
 * @param value 标签上要显示的文本值。
 * @returns 返回创建并配置好的新节点。
 */
    getItemLabel(position, value) {
        let itemLabel = this.getNode("itemLabel");
        let node = instantiate(itemLabel)
        node.parent = this.root;
        node.position = v3(position.x * this.alone, position.y * this.alone, 0)
        let label = node.getComponent(Label)
        label.string = value
        return node;
    }

    /**
     * 更新显示颜色的函数。
     * 该函数负责根据基础颜色列表，创建并配置每个颜色项的节点，包括颜色显示和标签文本。
     * 同时，设置选择框的位置，并为每个颜色项添加点击事件，以更新选择框的位置和选择索引。
     */
    updateShowColors() {

        this.graphics_Write = this.getNode("target/graphics_write", this.node, Graphics_Write);
        let item = this.getNode("item");
        let scrollView = this.colorsNode.getComponent(ScrollView)
        let len = this.baseColor.length;
        console.log("颜色类型个数:", len)
        this.tempColorList = []
        for (let i = 0; i < len; i++) {
            let color = this.baseColor[i];
            let node = instantiate(item);
            node.parent = scrollView.content;
            let pos = v3(50 + i * 100, 0, 0);
            node.position = pos;
            if (i === 0) this.selctBox.position = pos;
            let sprite = this.getNode("box",node,Sprite)
            sprite.color = color
            let label = this.getNode("Label", node, Label);
            label.string = (i + 1).toString();
            label.color = this.getContrastRatio(color);
            node["tag"] = i;
            node.on('click', (btn) => {
                let tnode = btn.node as Node;
                this.selectIndex = tnode["tag"];
                this.selctBox.position = tnode.position;
                this.writeBox();
            }, this)

            this.tempColorList.push(node);
        }
        let tansform = scrollView.content.getComponent(UITransform)
        let itemTansform = item.getComponent(UITransform);
        tansform.contentSize = size(itemTansform.contentSize.width * len, itemTansform.contentSize.height)
       
    }

    writeBox() {
        let list = this.getCurrentColor(this.selectIndex);
        this.writeCount=list.length;
        this.graphics_Write.initData(list, this.alone, this.contentSize);
        this.countLabel.string = `当前选项个数：${this.writeCount}\r\n`+`剩余个数：${this.count}`;
    }

    getContrastRatio(backgroundRgb) {
        // 计算背景色的相对亮度
        const contrastWhite = InsMgr.tool.rgbToRelativeLuminance(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);
        // 返回对比度较大的颜色
        return 0.5 < contrastWhite ? { r: 0, g: 0, b: 0, a: 255 } : { r: 255, g: 255, b: 255, a: 255 };
    }
    /**
     * 更新图片的缩放比例
     * 
     * 此方法用于调整图片的大小，通过改变其缩放比例实现。比例的调整是以一个固定的增量方式进行的，
     * 并且确保最终的缩放比例不会小于最小值或大于最大值。
     * 
     * @param {number} scale - 缩放比例的增量，默认值为0.1。表示每次调用时比例的变化量。
     * @param {number} minSacle - 最小缩放比例，默认值为1。表示缩放比例的下限。
     * @param {number} maxScale - 最大缩放比例，默认值为5。表示缩放比例的上限。
     */
    updataColorSize(scale = 0.1, minSacle = 1, maxScale = 5) {
        this.scaleNum = 1 + scale;
        if (this.scaleNum <= minSacle) {
            this.scaleNum = minSacle;
        }
        if (this.scaleNum >= maxScale) {
            this.scaleNum = maxScale;
        }
        this.target.node.setScale(v3(this.scaleNum, this.scaleNum, 1));
    }

    callback(slider: Slider) {
        let progress = slider.progress;
        this.sliderLabel.string = (progress * 100).toFixed(0) + "%";
        this.updataColorSize(progress, 1, 5);
        let opacity = this.root.getComponent(UIOpacity);
        if (!this.startPositon) {
            this.startPositon = this.fixPosition
        }
        let value = v3((this.fixPosition.x - this.startPositon.x) * progress, (this.fixPosition.y - this.startPositon.y) * progress, 0);
        this.target.node.position = value;
        opacity.opacity = parseInt((progress * 255).toFixed(0));
    }

    saveData() {
        let tempValue = [];
        let levelKey = 'selectColor';
        let isfinish = SaveStatus.UNFINISH
        if (this.count == 0) {
            isfinish = SaveStatus.FINISH;
        } else if (this.count == FIX_ITEM_HEIGHT * FIX_ITEM_HEIGHT) {
            isfinish = SaveStatus.DEFALUT;
        }
        if (isfinish === SaveStatus.UNFINISH) {
            for (let i = 0; i < this.colorLabel.length; i++) {
                tempValue[i] = []
                for (let j = 0; j < this.colorLabel[i].length; j++) {
                    if (this.colorLabel[i][j]) {
                        tempValue[i][j] = 0;
                    } else {
                        tempValue[i][j] = 1;
                    }
                }
            }
        }
        let levelData = {
            value: isfinish != SaveStatus.UNFINISH ? null : tempValue,
            state: isfinish//-1未开始 0:未完成 1:已完成  
        }
        let value = JSON.stringify(levelData);
        InsMgr.data.setData(levelKey, value)
    }

    loadLabelData() {
        let tempNode = this.getNode("ProgressBar");
        let progressBar = tempNode.getComponent(ProgressBar);
        let tempIndex = 0;
        this.nIntervId = setInterval(() => {
            for (let i = 0; i < 100; i++) {
                tempIndex = this.loadData(tempNode, progressBar, tempIndex);
                if (!tempIndex) 
                {
                    this.writeBox();
                    break;
                }
            }
        }, 100)
    }


    loadData(tempNode, progressBar, tempIndex) {
        if (tempIndex >= this.colorDataLabel.length) {
            clearInterval(this.nIntervId);
            this.nIntervId = null;
            tempNode.active = false;
            return null;
        }
        let { t, t1, pos, index } = this.colorDataLabel[tempIndex++]
        if (pos) {
            let nodeLabel = this.getItemLabel(pos, index);
            this.colorLabel[t][t1] = nodeLabel;
        } else {
            this.colorLabel[t][t1] = null;
        }
        progressBar.progress = tempIndex / this.colorDataLabel.length;
        return tempIndex;
    }

    // 是否自动完成所有的色块
    autoStroke(state=false) {
        let lenx = FIX_ITEM_WIDTH, leny = FIX_ITEM_HEIGHT;
        let selectColor = this.baseColor[this.selectIndex];
        let temp_array = []
        for (let i = 0; i < lenx; i++) {
            for (let j = 0; j < leny; j++) {
                let confrim = this.colors[i][j];
                if (selectColor._val == confrim._val) {
                    temp_array.push({ color: confrim, i: i, j: j });
                }
            }
        }
        let index = 0;
        let tempId = setInterval(() => {
            if (index >= temp_array.length) {
                clearInterval(tempId);
                this.graphics_Write.clear(); 
                if(state){
                    this.selectIndex++;
                    if (this.selectIndex < this.tempColorList.length) {
                        let tnode = this.tempColorList[this.selectIndex]
                        this.selctBox.position = tnode.position;
                        this.autoStroke();
                    } 
                }
                return;
            }
            let { color, i, j } = temp_array[index++];
            if (this.targetColors[i][j]._val != color._val) {
                this.count--
                this.writeBox();
                this.targetColors[i][j] = color;
                if (this.colorLabel[i][j]) {
                    this.colorLabel[i][j].destroy();
                    this.colorLabel[i][j] = null;
                }
                this.updateColor();
            } else {
                if (this.colorLabel[i][j]) {
                    this.colorLabel[i][j].destroy();
                    this.colorLabel[i][j] = null;
                    this.count--
                    this.writeBox();
                }
            }
        }, 5)
    }

    getCurrentColor(index) {
        let lenx = FIX_ITEM_WIDTH, leny = FIX_ITEM_HEIGHT;
        
        let selectColor = this.baseColor[index];
        let temp_array = []
        for (let i = 0; i < lenx; i++) {
            for (let j = 0; j < leny; j++) {
                let confrim = this.colors[i][j];
                if (selectColor._val == confrim._val && this.colorLabel[i][j]) {
                    temp_array.push({ color: confrim, x: j, y: leny - i - 1 });
                }
            }
        }
        return temp_array;
    }

    unRegister() {
        if (this.nIntervId) {
            clearInterval(this.nIntervId);
            this.nIntervId = null;
        }
    }
}



