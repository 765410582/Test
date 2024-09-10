import { _decorator, assetManager, Color, Component, EventTouch, instantiate, Label, Layers, Layout, Node, ProgressBar, ScrollView, size, Size, Slider, Sprite, SpriteFrame, sys, Texture2D, UIOpacity, UITransform, v2, v3, Vec3 } from 'cc';
import { ToolHelper } from '../ToolHelper/ToolHelper';
import { LayerManager } from '../test/LayerManager';
import { config, EventType } from '../TestMain';
import { EventMgr } from '../test/EventMgr';
const { ccclass, property } = _decorator;
let FIX_ITEM_WIDTH = 33;
let FIX_ITEM_HEIGHT = 33;


export enum SaveStatus {
    DEFALUT = -1,//-1未开始 
    UNFINISH = 0,//0:未完成
    FINISH = 1// 1:已完成 
}
@ccclass('SelectColorMgr')
export class SelectColorMgr extends Component {
    contentSize: Size = null;
    alone: number = 0;
    colors = [];
    targetColors = [];
    baseColor = [];
    baseColorMap = new Map();
    colorLabel = [];
    colorDataLabel = [];
    sf: Sprite = null;
    selectIndex: number = 0;
    countLabel: Label = null;
    count: number = 0;
    colorsNode: Node;
    selctBox: Node;
    data: any;
    textures = []
    scaleNum: number = 1;
    slider: Slider;
    sliderLabel: Label;
    root: Node;
    startPositon: Vec3 = null;
    fixPosition: Vec3 = null;
    nIntervId = null;
    init(data) {
        FIX_ITEM_WIDTH = data.width;
        FIX_ITEM_HEIGHT = data.height;
        this.data = data;
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
        this.colorsNode = this.node.getChildByName("colors");
        this.selctBox = this.colorsNode.getComponent(ScrollView).content.getChildByName("select");
        this.selctBox.getComponent(UITransform).priority = 1;
        this.countLabel = this.colorsNode.getChildByName("countLabel").getComponent(Label);
        this.sf = this.node.getChildByName("Sprite").getComponent(Sprite);
        this.slider = this.node.getChildByName("Slider").getComponent(Slider);
        this.sliderLabel = this.slider.node.getChildByName("Label").getComponent(Label);
        this.root = this.node.getChildByPath("Sprite/root");
        // 像素块颜色设置
        let transform = this.sf.node.getComponent(UITransform)
        this.contentSize = transform.contentSize
        this.alone = this.contentSize.width / FIX_ITEM_WIDTH;

        let worldPos = this.sf.node.getWorldPosition();
        let zeroPos = v3(worldPos.x - this.contentSize.width / 2, worldPos.y - this.contentSize.height / 2, worldPos.z);
        let maxPos = v3(worldPos.x + this.contentSize.width / 2, worldPos.y + this.contentSize.height / 2, worldPos.z);

        this.fixPosition = worldPos;
        this.sf.node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            let uiLocation = event.getUILocation();
            worldPos = this.sf.node.getWorldPosition();
            this.startPositon = v3(uiLocation.x, uiLocation.y, 0)
            zeroPos = v3(worldPos.x - this.contentSize.width / 2 * this.scaleNum, worldPos.y - this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            maxPos = v3(worldPos.x + this.contentSize.width / 2 * this.scaleNum, worldPos.y + this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            this.clickColor(event, zeroPos, maxPos);
        }, this);
        this.sf.node.on(Node.EventType.TOUCH_MOVE, (event) => {
            worldPos = this.sf.node.getWorldPosition();
            zeroPos = v3(worldPos.x - this.contentSize.width / 2 * this.scaleNum, worldPos.y - this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            maxPos = v3(worldPos.x + this.contentSize.width / 2 * this.scaleNum, worldPos.y + this.contentSize.height / 2 * this.scaleNum, worldPos.z);
            this.clickColor(event, zeroPos, maxPos);
        }, this);
        this.node.getChildByName("returnBtn").on('click', this.onReturn, this);
        this.slider!.node.on('slide', this.callback, this);
    }
    onReturn() {
        EventMgr.Instance.displayer(EventType.GameEnd,{
            page:config.SelectColor,
            suc:()=>{
                this.saveData()
                if (this.sf) {
                    this.sf.node.destroy();
                }
            }
        });
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
    clickColor(
        event, zeroPos, maxPos) {
        let uiLocation = event.getUILocation();
        if (uiLocation.x >= zeroPos.x && uiLocation.y >= zeroPos.y && uiLocation.x <= maxPos.x && uiLocation.y <= maxPos.y) {
            let x = Math.floor((uiLocation.x - zeroPos.x) / (this.alone * this.scaleNum));
            let y = Math.floor((uiLocation.y - zeroPos.y) / (this.alone * this.scaleNum));

            let selectColor = this.baseColor[this.selectIndex];
            let x_1 = FIX_ITEM_WIDTH - 1 - y
            let y_1 = x;
            let result = x_1 >= 0 && y_1 >= 0 && x_1 < this.colors.length && y_1 < this.colors[0].length;
            if (!result) {
                return;
            }
            let confrim = this.colors[x_1][x];
            if (selectColor._val == confrim._val) {
                if (this.targetColors[x_1][y_1]._val != confrim._val) {
                    this.count--
                    this.countLabel.string = this.count.toString();
                    this.targetColors[x_1][y_1] = confrim;
                    if (this.colorLabel[x_1][y_1]) {
                        this.colorLabel[x_1][y_1].destroy();
                        this.colorLabel[x_1][y_1] = null;
                    }
                    this.updateColor();
                } else {
                    if (this.colorLabel[x_1][y_1]) {
                        this.colorLabel[x_1][y_1].destroy();
                        this.colorLabel[x_1][y_1] = null;
                        this.count--
                        this.countLabel.string = this.count.toString();
                    }
                }
            } else {
                console.error("请选择正确的颜色");
            }
        }
    }
    /**
    * 更新颜色信息。
    * 此方法通过获取当前图像的像素数据，然后使用ToolHelper的函数将这些数据转换为精灵对象的颜色表现形式。
    * 这一过程对于处理图像颜色变化或应用颜色过滤等操作是非常关键的。
    */
    updateColor() {
        const data = this.getPixelData();
        ToolHelper.pixelsToSprite(this.sf, data);
    }


    /**
     * 初始化颜色信息。
     * 该方法用于根据图像像素数据，初始化颜色数组及相关属性，为后续处理和显示图像做准备。
     * 这里主要处理的是将像素数据映射到固定尺寸的颜色数组中，并计算出对应的颜色标签。
     */
    addColors() {
        // 读取数据/本地/服务器
        let { state, value } = this.getData();
        this.colors = [];
        this.targetColors = [];
        this.colorLabel = [];

        let [pixels, baseColor, baseColorMap] = ToolHelper.getLoadPixels(this.data.spriteFreme, FIX_ITEM_WIDTH, FIX_ITEM_HEIGHT);
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
                let gray = (color.r + color.g + color.b) / 3
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
        this.countLabel.string = this.count.toString();
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
        const data = new Uint8Array(width * height * (FIX_ITEM_WIDTH * FIX_ITEM_HEIGHT));    // rgba
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
        let itemLabel = this.node.getChildByName("itemLabel")
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
        let item = this.node.getChildByName("item");
        let scrollView = this.colorsNode.getComponent(ScrollView)
        let len = this.baseColor.length;
        for (let i = 0; i < len; i++) {
            let color = this.baseColor[i];
            let node = instantiate(item);
            node.parent = scrollView.content;
            let pos = v3(50 + i * 100, 0, 0);
            node.position = pos;
            if (i === 0) {
                this.selctBox.position = pos;
            }
            let sprite = node.getComponent(Sprite);
            sprite.color = color
            let label = node.getChildByName("Label").getComponent(Label);
            label.string = (this.baseColorMap.get(color._val) + 1).toString();
            sprite.node["tag"] = i;
            node.on('click', (btn) => {
                let tnode = btn.node as Node;
                this.selectIndex = tnode["tag"];
                this.selctBox.position = tnode.position;
            }, this)
        }
        let tansform = scrollView.content.getComponent(UITransform)
        let itemTansform = item.getComponent(UITransform);
        tansform.contentSize = size(itemTansform.contentSize.width * len, itemTansform.contentSize.height)
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
        this.sf.node.setScale(v3(this.scaleNum, this.scaleNum, 1));
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
        this.sf.node.position = value;
        opacity.opacity = parseInt((progress * 255).toFixed(0));
    }

    saveData() {
        let tempValue = [];
        let levelKey = 'level' + this.data.index;
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
        sys.localStorage.setItem(levelKey, value);
    }

    getData() {
        let levelKey = 'level' + this.data.index
        let levelData = sys.localStorage.getItem(levelKey);
        if (levelData) {
            console.log(`${levelKey} = ${levelData}`)
            let { state, value } = JSON.parse(levelData);

            return { state: state, value: value };
        } else {
            console.log(`${levelKey} is not exist`);
            return { state: SaveStatus.UNFINISH, value: null };
        }
    }


    loadLabelData() {
        let tempNode = this.node.getChildByName("ProgressBar");
        let progressBar = tempNode.getComponent(ProgressBar);
        let tempIndex = 0;
        this.nIntervId = setInterval(() => {
            for (let i = 0; i < 10; i++) {
                tempIndex = this.loadData(tempNode, progressBar, tempIndex);
                if (!tempIndex) break;
            }
        }, 1)
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

    protected onDestroy(): void {
        if (this.nIntervId) {
            clearInterval(this.nIntervId);
            this.nIntervId = null;
        }
    }
}



