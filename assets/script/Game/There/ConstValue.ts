import { CellView } from "./view/CellView";

export const GridWidth = 7;
export const GridHeight = 7;
export const GridSize = 100;
export const GridSpace = 5;

// 单个色块类型
export const enum ChessType {
    // 正常棋子
    Chess = 1,
    // 四个相同的合成
    ChessFour = 2,
    // TL相同的合成
    ChessTL = 3,
    // 五个相同的合成
    ChessFive = 4,
    NONE = 0
}
// 单个色块状态    1.无状态 2.可选中 3.可连通 4.可下落 5.死亡 6.消失
export const enum ChessStatus {
    NONE = 0b0000000,
    SELECTED = 0b0000001,
    CONNECTED = 0b0000010,
    FALLING = 0b0000100,
    DEAD = 0b0001000,
    DISAPPEAR = 0b0010000
}

export const enum ChessFlag {
    // 1.无 2.选中 3.选中+飞走 4.选中+飞走+飞走标记
    NONE = 0b0000,
    SELECTED = 0b0001,
    SELECTED_FLY = 0b0010,
    SELECTED_FLY_FLAG = 0b0100,
}

// 棋盘单个位置 显示状态 1.有/无 2.叠加 3.封锁 4.飞走标记
export const enum ViewStatus {
    Used = 0b1,
    Overlay = 0b10,
    Block = 0b100,
    FlyingFlag = 0b1000
}



export interface ViewData {
    chess?: CellView;
    status: ViewStatus;
    buff?: any;
}

// 控制动画播放
export let isPlayAnim=true;



