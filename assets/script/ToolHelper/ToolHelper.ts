import { _decorator, Color, Component, director, EventTouch, gfx, Node, Rect, Sprite, SpriteFrame, Texture2D, tween, UITransform, v3, Vec3 } from 'cc';
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
    static spriteAlphaBar(data) {
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
    static capitalizeFirstLetter(str: string | null): string {
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
    static getRandomColor(): string {
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
    static getPixels(sp: SpriteFrame, rect?: Rect): Uint8Array {
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
    static pixelsToSprite(drawImg: Sprite, data: HTMLCanvasElement | HTMLImageElement | ArrayBufferView | ImageBitmap) {
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
    static calculateASpaceToBSpacePos(a: Node, b: Node, aPos: Vec3): Vec3 {
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
    static getLoadPixels(spriteFrame: SpriteFrame, maxx = 15, maxy = 15, colorSetoff = 20):[any[],any[],Map<number, Color>] {
        if (!spriteFrame || typeof spriteFrame.width !== 'number') {
            throw new Error("Invalid spriteFrame object.");
        }
        const width = spriteFrame.width;
        const pixels = ToolHelper.getPixels(spriteFrame);
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
  static getListRanodm(list1: any[], list2: any[]) {
        let newList = list1.concat(list2);
        let uniqueList = newList.filter((item, index) => newList.indexOf(item) === index);
        let randomIndex = Math.floor(Math.random() * uniqueList.length);
        return uniqueList[randomIndex];
    }

    static screenPosToSpacePos(event: EventTouch, space: Node): Vec3 {
        let uil = event.getUILocation();
        let worldPos: Vec3 = v3(uil.x, uil.y);
        let mapPos: Vec3 = space.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
        return mapPos;
    }
}


