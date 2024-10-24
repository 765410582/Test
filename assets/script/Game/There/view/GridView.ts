import { _decorator, assetManager, Color, Component, instantiate, Node, Prefab, Size, Sprite, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { GridHeight, GridSize, GridSpace, GridWidth, isPlayAnim } from '../ConstValue';

import { CellView } from './CellView';
import { GameStatus, isPointOutOfGrid } from '../ChessBoardMgr';
import { UIConfigData, UIID } from '../../../main/ViewConfig';
import { InsMgr } from '../../../frame/InsMgr';

const { ccclass, property } = _decorator;
// 不规则关卡规则 1. 代表列缺失 2.代表行缺失 3.代表数组缺失
export enum RuleType {
    RowMiss = 1,
    ColMiss = 2,
    ArrayMiss = 3
}

@ccclass('GridView')
export class GridView extends Component {
    views: Node[][];
    colors: Color[] = [];
    boxs: Boolean[][] = [];
    centerPos: Vec3;
    zeroPos: Vec3;
    selectNode: Node = null;
    initView(parentRoot, data, length, passData) {

        this.initViewNode(passData);
        this.updateTempColors(length);
        this.updateCenterPos(parentRoot);
        this.updateViewNode(parentRoot, data);
    }

    updateTempColors(length: number) {
        for (let i = 0; i < length; i++) {
            let itemRandom = InsMgr.tool.getRandomColor()
            let color = new Color().fromHEX(itemRandom)
            this.colors.push(color);
        }
    }
    updateCenterPos(parentRoot) {
        let size = parentRoot.getComponent(UITransform).contentSize;
        this.zeroPos = v3(-size.width / 2 + GridSize / 2, -size.height / 2 + GridSize / 2);
        let tatolSpace = v3(GridSpace * (GridWidth - 1) / 2, GridSpace * (GridHeight - 1) / 2);
        let boxSize = v3((size.width - GridSize * GridWidth) / 2, (size.height - GridSize * GridHeight) / 2)
        this.centerPos = this.zeroPos.add(boxSize).subtract(tatolSpace);
        this.selectNode = parentRoot.getChildByName("selectNode");
        this.selectNode.getComponent(UITransform).contentSize = new Size(GridSize + GridSpace, GridSize + GridSpace);
        this.selectNode.active = false;

    }

    initViewNode(passData) {
        let type = passData.Type;
        let ruleData = passData.RuleData;
        this.views = new Array(GridWidth);
        this.boxs = new Array(GridWidth);
        for (let i = 0; i < GridWidth; i++) {
            this.views[i] = new Array(GridHeight);
            this.boxs[i] = new Array(GridHeight);
            for (let j = 0; j < GridHeight; j++) {
                this.views[i][j] = null;
                this.boxs[i][j] = null;
                for (let k = 0; k < ruleData.length; k++) {
                    let item = ruleData[k];
                    switch (type) {
                        case RuleType.RowMiss:
                            if (i === item.x) {
                                this.boxs[i][j] = true;
                                break;
                            }
                            break;
                        case RuleType.ColMiss:
                            if (j === item.y) {
                                this.boxs[i][j] = true;
                                break;
                            }
                            break;
                        case RuleType.ArrayMiss:
                            if (i === item.x && j === item.y) {
                                this.boxs[i][j] = true;
                                ruleData.splice(k, 1);
                                k--;
                                break;
                            }
                            break;
                        default:
                            console.error("unknow rule type");
                            continue;
                    }
                }
            }
        }
    }
    async updateViewNode(parentRoot, data) {

        let info={handle:"handleA",prefab:"prefab/Cell"}
        let prefab=await InsMgr.res.getPrefab(info);
        for (let i = 0; i < GridWidth; i++) {
            for (let j = 0; j < GridHeight; j++) {
                if (this.boxs[i][j]) continue;
                let node = instantiate(prefab);
                node.parent = parentRoot;
                this.updateNodeInfo(node, { x: i, y: j }, data);
            }
        }
    }

    updateNodeInfo(node, param, data) {
        let { x, y } = param;
        let transform = node.getComponent(UITransform)
        transform.contentSize = new Size(GridSize, GridSize);
        let width = x * (GridSize + GridSpace);
        let height = y * (GridSize + GridSpace);
        node.setPosition(v3(width + this.centerPos.x, height + this.centerPos.y))
        this.views[x][y] = node;
        let sprite = node.getComponent(Sprite)
        let { id } = data[x][y];
        let index = parseInt(id.split("_")[1]) - 1
        sprite.color = this.colors[index];
        node.getComponent(CellView).init(data[x][y]);
    }



    /**
     * 将触摸位置转换为网格单元格坐标
     * 
     * 该函数的目的是将触摸事件的坐标位置转换成在网格系统中的具体单元格坐标
     * 它首先根据网格大小和网格间距，计算触摸位置对应于网格左上角的行列数
     * 然后检查计算出的行列数是否超出网格范围如果超出，则返回null；否则，返回对应的网格单元格坐标
     * 
     * @param pos 触摸位置的坐标，包含 x 和 y 属性
     * @returns 如果触摸位置在网格范围内，则返回一个三维向量，表示对应的网格单元格坐标；如果超出范围，则返回 null
     */
    getTouchPosToCell(pos) {
        // 计算触摸位置对应于网格左上角的行列数
        let i = Math.floor((pos.x - this.centerPos.x + GridSize / 2) / (GridSize + GridSpace));
        let j = Math.floor((pos.y - this.centerPos.y + GridSize / 2) / (GridSize + GridSpace));

        // 检查行列数是否超出网格范围
        if (isPointOutOfGrid(i, j) || this.boxs[i][j]) {
            return null; // 超出范围，返回 null
        } else {
            return v3(i, j, 0); // 在范围内，返回网格单元格坐标
        }
    }

    getXYToPos(x, y) {
        return v3(x * (GridSize + GridSpace) + this.centerPos.x, y * (GridSize + GridSpace) + this.centerPos.y)
    }



    getData(x, y) {
        return this.views[x][y];
    }

    getSelectNode() {
        if (!this.selectNode.active) {
            this.selectNode.active = true;
        }
        return this.selectNode;
    }

    setSelectPosition(pos) {
        this.getSelectNode().setPosition(pos)
    }

    updateView(models) {
        console.log("models", models);
        console.log("views", this.views);
        for (let i = 0; i < models.length; i++) {
            let { x, y } = models[i]
            let cellView = this.views[x][y].getComponent(CellView);
            cellView.updateView(this)
            console.log("cellView", cellView);
        }
    }

}


