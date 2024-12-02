import { __private, _decorator, Color, Component, director, EventTouch, gfx, Label, Node, Rect, Sprite, SpriteFrame, Texture2D, tween, UITransform, v2, v3, Vec2, Vec3, Widget } from 'cc';
import { ReNodeData } from '../ConfigData';
import { EventType } from '../../TestMain';
import { InsMgr } from '../../frame/InsMgr';
import { l10n } from 'db://localization-editor/l10n'
const { ccclass, property } = _decorator;

@ccclass('ToolHelper')
export class ToolHelper extends Component {
    /**
    * 控制精灵的透明度变化，实现淡入或淡出效果。
    * 
    * @param {Object} data 包含精灵对象、目标透明度、过渡时间及回调函数的对象。
    * @param {Sprite} data.sprite 需要进行透明度变化的精灵对象。
    * @param {number} data.alpha 目标透明度，0为完全透明（淡出），1为完全不透明（淡入）。
    * @param {number} data.time 过渡时间，单位为毫秒。
    * @param {Function} data.call 回调函数，透明度变化完成后调用。
    */
    spriteAlphaBar(data) {
        let { sprite, alpha, time, call } = data;
        const targetAlpha = { value: 255 };
        const originColor = sprite.color;
        let move = tween(targetAlpha)
            .to(
                time,
                { value: alpha },
                {
                    onUpdate: (target, ratio) => {
                        let curResult = alpha == 0 ? (1 - ratio) : ratio;
                        sprite.color = new Color(originColor.r, originColor.g, originColor.b, curResult * 255);
                        if (curResult == alpha) {
                            if (typeof call == "function") call()
                        }
                    },
                }
            )
        move.start();
    }


    /**
    * 将给定字符串的首字母转换为大写。
    * 如果输入不是字符串或为空，则原样返回输入。
    * 此方法用于处理字符串，确保它们以大写字母开始。这在某些情况下很有用，
    * 比如创建标题或根据业务规则格式化字符串。
    * 
    * @param {string | null} str - 要处理的字符串。如果传入非字符串或空字符串，则方法将打印错误并返回。
    * @returns {string} - 处理后的字符串，首字母大写。如果输入无效，则返回空字符串。
    */
    capitalizeFirstLetter(str: string | null): string {
        if (typeof str !== 'string' || !str || str.length == 0) {
            console.error("传入字符串error", str);
            return str;
        }

        return str.charAt(0).toUpperCase() + str.slice(1);

    }

    /**
     * 生成一个随机颜色的字符串表示。
     * 
     * 颜色字符串以“#”开头，后跟六个十六进制数字或字母，这六个字符组合在一起定义了一个唯一的颜色。
     * 此方法通过随机选择十六进制数位的字符来生成随机颜色，确保了颜色的随机性和唯一性。
     * 
     * @returns {string} 一个随机生成的十六进制颜色字符串，例如 "#3E4F5C"。
     */
    getRandomColor(): string {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
  * 获取贴图中的像素
  * @param tex 贴图资源,可以是单个贴图或者是合图的贴图
  * @param rect 如果是单个贴图则不需要传裁剪矩形,合图中的贴图请传入spriteFrame.rect用来确定偏移位置和裁剪大小
  * @returns Uint8Array 按rgba排列
  */
    getPixels(sp: SpriteFrame, rect?: Rect): Uint8Array {
        let width = sp.width;
        let height = sp.height;
        const gfxTexture = sp.getGFXTexture();
        if (!gfxTexture) {
            return null;
        }
        const bufferViews: ArrayBufferView[] = [];
        const regions: gfx.BufferTextureCopy[] = [];

        const region0 = new gfx.BufferTextureCopy();
        region0.texOffset.x = rect?.x || 0;
        region0.texOffset.y = rect?.y || 0;
        region0.texExtent.width = width;
        region0.texExtent.height = height;
        regions.push(region0);

        const buffer = new Uint8Array(width * height * 4);
        bufferViews.push(buffer);

        director.root?.device.copyTextureToBuffers(gfxTexture, bufferViews, regions)
        return buffer;
    }

    /**
     * 将给定的图像数据转换为精灵纹理，用于更新精灵的外观。
     * 此函数主要用于处理精灵的纹理更新，例如，当需要从一个新的HTMLCanvasElement、HTMLImageElement、ArrayBufferView或ImageBitmap更新精灵的外观时。
     * ps:图集这里会出现错误
     * 
     * @param drawImg 要更新的精灵对象。
     * @param data 新的图像数据，可以是HTMLCanvasElement、HTMLImageElement、ArrayBufferView或ImageBitmap。
     */
    pixelsToSprite(drawImg: Sprite, data: HTMLCanvasElement | HTMLImageElement | ArrayBufferView | ImageBitmap) {
        if (!drawImg || !data) {
            console.warn(`drawImg or data is null`);
            return;
        }
        let texture = new Texture2D();
        let contentSize = drawImg.node.getComponent(UITransform).contentSize;
        texture.reset({ width: contentSize.width, height: contentSize.height, format: drawImg.spriteFrame.texture.getPixelFormat() });
        texture.uploadData(data);
        let destroyTexture = drawImg.spriteFrame.texture
        if (destroyTexture) {
            destroyTexture.destroy();
        }
        drawImg.spriteFrame.texture = texture;
    }

    /**
     * 节点之间坐标互转
     * @param a         A节点
     * @param b         B节点
     * @param aPos      A节点空间中的相对位置
     */
    calculateASpaceToBSpacePos(a: Node, b: Node, aPos: Vec3): Vec3 {
        var world: Vec3 = a.getComponent(UITransform)!.convertToWorldSpaceAR(aPos);
        var space: Vec3 = b.getComponent(UITransform)!.convertToNodeSpaceAR(world);
        return space;
    }

    /**
     * 根据精灵帧获取像素点信息，并对其进行颜色归类。
     * @param spriteFrame 精灵帧对象，包含要处理的图像信息。
     * @param maxx 每行划分的区域数量，默认为15。
     * @param maxy 每列划分的区域数量，默认为15。
     * @param colorSetoff 颜色偏差阈值，默认为20。用于判断两个颜色是否接近。
     * @returns 返回一个包含三个元素的数组：
     *          1. colorList：每个区域的颜色列表。
     *          2. baseColor：所有区域中独特的颜色集合。
     *          3. baseColorMap：映射每个区域颜色到基本颜色的索引。
     */
    getLoadPixels(spriteFrame: SpriteFrame, maxx = 15, maxy = 15, colorSetoff = 20): [any[], any[], Map<number, Color>] {
        if (!spriteFrame || typeof spriteFrame.width !== 'number') {
            throw new Error("Invalid spriteFrame object.");
        }
        const width = spriteFrame.width;
        const pixels = this.getPixels(spriteFrame);
        if (!pixels) {
            throw new Error("Failed to get pixels from spriteFrame.");
        }
        const tempAlone = Math.floor(width / maxx)
        const colorList = [];
        const baseColor = [];
        const baseColorMap = new Map();
        let i = 0
        const gray = Color.GRAY;
        const map = new Map([[gray._val, gray]]);
        for (let n = 0; n < maxx; n++) {
            colorList[n] = []
            for (let m = 0; m < maxy; m++) {
                i = (((n + 0.5) * tempAlone) * width * 4) + ((m + 1) * tempAlone * 4)
                let color = new Color(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])
                if (color._val !== 0) {
                    //相近颜色同质化
                    let foundSimilar = true;
                    map.forEach(item => {
                        let rc = Math.abs(item.r - color.r)
                        let gc = Math.abs(item.g - color.g)
                        let bc = Math.abs(item.b - color.b)
                        let ac = Math.abs(item.a - color.a)
                        let result = rc < colorSetoff && gc < colorSetoff && bc < colorSetoff && ac < colorSetoff;
                        if (result) {
                            color = item;
                            result = false;
                        }
                    })
                    if (foundSimilar) {
                        map.set(color._val, color)
                    }
                }
                colorList[n].push(color);
            }
        }
        map.forEach((color, key) => {
            baseColor.push(color);
            baseColorMap.set(key, baseColor.length - 1);
        })
        return [colorList, baseColor, baseColorMap]
    }

    // 两个数组去掉重复的元素后随机取一个元素
    getListRanodm(list1: any[], list2: any[]) {
        let newList = list1.concat(list2);
        let uniqueList = newList.filter((item, index) => newList.indexOf(item) === index);
        let randomIndex = Math.floor(Math.random() * uniqueList.length);
        return uniqueList[randomIndex];
    }

    screenPosToSpacePos(event: EventTouch, space: Node): Vec3 {
        let uil = event.getUILocation();
        let worldPos: Vec3 = v3(uil.x, uil.y);
        let mapPos: Vec3 = space.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
        return mapPos;
    }

    // 颜色取反
    getInverseColor(color: Color): Color {
        return new Color(255 - color.r, 255 - color.g, 255 - color.b, color.a);
    }


    /**
     * 判断一个字符是否为中文字符
     * 
     * @param char 待判断的字符，预期输入为单个字符字符串
     * @returns 返回布尔值，表示字符是否为中文字符
     * 
     * 本函数使用正则表达式来匹配字符是否属于中文范围
     * 中文字符的Unicode范围为[\u4e00-\u9fa5]
     * 使用正则表达式测试字符是否符合该范围，从而判断其是否为中文字符
     */
    isChineseCharacter(char: string): boolean {
        const chineseRegex = /^[\u4e00-\u9fa5]$/;
        return chineseRegex.test(char);
    }

    /**
 * 检查字符串是否全部由汉字组成
 * 
 * 此函数使用正则表达式来验证输入的字符串是否每一个字符都是汉字
 * 正则表达式的范围 [\u4e00-\u9fa5] 匹配所有汉字字符
 * 
 * @param str 要检查的字符串
 * @returns 如果字符串全部由汉字组成，则返回 true；否则返回 false
 */
    areAllChineseCharacters(str: string): boolean {
        const chineseRegex = /^[\u4e00-\u9fa5]+$/;
        return chineseRegex.test(str);
    }

    /**
     * 统一组件大小位置
     *  node:要调整的节点 
     *  rect:要调整的节点的父节点 { top: 0, bottom: 0, left: 0, right: 0 }最多四个 1~4
     *  size:要调整的节点的大小
     * 
     **/
    nodealign(node: Node, data) {
        let { rect, size } = data;
        this.addWidget(node, rect);
        if (size) {
            let trans = node.getComponent(UITransform)
            trans.contentSize = size;
        }
    }
    /**
     *统一返回界面处理  1.大小统一 2.在界面位置统一 2.回调处理统一
     * node:要处理的节点
     * cb:回调函数
     * */
    reBtnCall(node, cb = null) {
        this.nodealign(node, ReNodeData);
        node.getChildByName("Label").getComponent(Label).string = l10n.t("return");
        node.on("click", () => {
            this.layerEnd(cb)
        });
    }

    layerEnd(cb = null) {
        InsMgr.event.emit(EventType.GameEnd, {
            page: InsMgr.layer.getCurLevel(),
            suc: () => {
                cb && cb();
            }
        });
    }

    /**
     * 给节点添加或更新Widget组件，并设置对齐方式
     * @param node 要添加Widget组件的节点
     * @param dir 对齐方向和偏移量，包括top、bottom、left、right四个可选属性，默认值为0
     */
    addWidget(node, dir = { top: 0, bottom: 0, left: 0, right: 0 }) {
        let widget = node.getComponent(Widget) as Widget;
        if (!widget) {
            widget = node.addComponent(Widget) as Widget;
            widget.alignMode = Widget.AlignMode.ONCE;
        }
        let keys = Object.keys(dir)
        keys.forEach(key => {
            if (key) {
                widget[key] = dir[key];
                let tkey = this.capitalizeFirstLetter(key)
                widget[`isAlign${tkey}`] = true;
            }
        })
        widget.updateAlignment();
    }


    getNode<T extends Component>(parent: Node, classConstructor: __private._types_globals__Constructor<T> | __private._types_globals__AbstractedConstructor<T> = null, name: string = "node") {
        let node = new Node(name);
        node.addComponent(UITransform)
        node.parent = parent;
        if (classConstructor) {
            node.addComponent(classConstructor)
        }
        return node;
    }

    getDisance(pos1: Vec3, pos2: Vec3): number {
        if (!(pos1 instanceof Vec3) || !(pos2 instanceof Vec3)) {
            throw new TypeError('Both arguments must be instances of Vec3');
        }

        if (typeof pos1.x !== 'number' || typeof pos1.y !== 'number' || typeof pos1.z !== 'number' ||
            typeof pos2.x !== 'number' || typeof pos2.y !== 'number' || typeof pos2.z !== 'number') {
            throw new Error('Vec3 properties must be numbers');
        }

        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    splitArray<T>(arr: T[], index: number): [T[], T[]] {
        const firstPart = arr.slice(0, index);
        const secondPart = arr.slice(index);
        return [firstPart, secondPart];
    }

    // 计算子弹到目标的归一化方向向量
    getCalculateDirection(target: Vec3, pos: Vec3): Vec2 {
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // 归一化向量
        return v2(dx / distance, dy / distance)
    }

    // 计算子弹到目标的旋转角度
    getCalculateDegrees(target: Vec3, pos: Vec3): number {
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const angle = Math.atan2(dy, dx); // 计算弧度
        // 将弧度转换为度数
        return angle * (180 / Math.PI);
    }
    // 通过角度转成弧度
    getDegreesInAngle(degree) {
        return degree / (180 / Math.PI)
    }

    // 通过自身位置和弧度预算出目标位置
    getTargetPos(angle, pos, distance = 1) {

        const targetX = pos.x + Math.cos(angle) * distance;
        const targetY = pos.y + Math.sin(angle) * distance;
        return v3(targetX, targetY, 0)
    }

    getTextureToSpriteFrame(tex: Texture2D): SpriteFrame {
        let sf = new SpriteFrame();
        sf.texture = tex;
        return sf;
    }


/**
 * 合并两个对象的实例属性和原型，创建一个新的对象
 * 此函数旨在合并两个对象的属性和原型，生成一个新的具有合并后特性的对象
 * @param {Object} obj1 - 第一个对象，其属性和原型将被合并
 * @param {Object} obj2 - 第二个对象，其属性和原型将被合并
 * @returns {Object} - 返回一个新的对象，具有合并后 obj1 和 obj2 的实例属性和原型
 */
    mergeObjectsWithPrototype(obj1, obj2) {
        // 创建一个新对象，其原型是 obj1 和 obj2 原型的合并
        const mergedPrototype = Object.create(Object.prototype);

        // 合并原型：使用 `Object.getPrototypeOf()` 获取原型，并手动合并
        Object.setPrototypeOf(mergedPrototype, obj1.constructor.prototype);
        Object.setPrototypeOf(mergedPrototype, obj2.constructor.prototype);

        // 创建新对象，原型是合并后的原型
        const mergedObject = Object.create(mergedPrototype);

        // 合并实例属性
        Object.assign(mergedObject, obj1, obj2);

        return mergedObject;
    }

     getBrowser() {
        const userAgent = navigator.userAgent;
      
        // 检查 Chrome 浏览器
        if (userAgent.includes("Chrome") && !userAgent.includes("Edge") && !userAgent.includes("OPR")) {
          return "Chrome";
        }
        
        // 检查 Firefox 浏览器
        if (userAgent.includes("Firefox")) {
          return "Firefox";
        }
      
        // 检查 Safari 浏览器
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
          return "Safari";
        }
      
        // 检查 Edge 浏览器
        if (userAgent.includes("Edg")) {
          return "Edge";
        }
      
        // 其他浏览器
        return "Unknown Browser";
      }

    //   展开数组层数
    flattenArray(arr, depth = 1) {
        return arr.reduce((acc, val) => {
            return acc.concat(depth > 1 && Array.isArray(val) ? this.flattenArray(val, depth - 1) : val);
        }, []);
    }

      
}

export class mayThrowError {
    name: string;
    message: any;
    stack: string;
    /**
 * 构造函数，用于初始化一个错误对象
 * @param {string} message - 错误信息
 */
    constructor(message) {
        this.name = "错误"
        this.message = message
        alert("当前功能没有开发");
    }
}
