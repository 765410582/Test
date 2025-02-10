export enum LayerType{
  /** 游戏层 */
  Game = "LayerGame",
  /** 主界面层 */
  UI = "LayerUI",
  /** 弹窗层 */
  PopUp = "LayerPopUp",
    /** 预加载层 */
  PreLoad = "LayerPreLoad",
  /** 模式窗口层 */
  Dialog = "LayerDialog",
  /** 系统触发模式窗口层 */
  System = "LayerSystem",
  /** 滚动消息提示层 */
  Notify = "LayerNotify",
  /** 新手引导层 */
  Guide = "LayerGuide",

}
export enum UIID{
    Loading=0,
    GameList,
    ChessBoard ,
    RedGreenLight,
    SelectColor,
    HeroTest,
    GravityRollerCoaster,
    PanelPopup,
    NetLoading,
    Tetris,
    GamePopup,
    ColorList,
    WaitingMatch,
    GameLogin
}
export var UIConfigData={
    // resources
    [UIID.Loading]:{layer: LayerType.PreLoad, prefab: "prefab/Loading",uiclass: "LoadingMgr",handle:"resources"},
    [UIID.NetLoading]:{layer: LayerType.Dialog, prefab: "prefab/NetLoading",uiclass: "NetLoadingMgr",handle:"resources"},
    //bundleA
    [UIID.GameList]:{layer: LayerType.UI, prefab: "prefab/GameList",uiclass: "GameListMgr",handle:"bundleA"},
    [UIID.ChessBoard]:{layer: LayerType.UI, prefab: "prefab/ChessBoard",uiclass: "ChessBoardMgr",handle:"bundleA"},
    [UIID.RedGreenLight]:{layer: LayerType.UI, prefab: "prefab/RedGreenLight",uiclass: "RedGreenLightMgr",handle:"bundleA"},
    [UIID.SelectColor]:{layer: LayerType.UI, prefab: "prefab/SelectColor",uiclass: "SelectColorMgr",handle:"bundleA"},
    [UIID.HeroTest]:{layer: LayerType.UI, prefab: "prefab/HeroTest",uiclass: "HeroTestMgr",handle:"bundleA"},
    [UIID.GravityRollerCoaster]:{layer: LayerType.UI, prefab: "prefab/GravityRollerCoaster",uiclass: "GravityRollerCoasterMgr",handle:"bundleA"},
    [UIID.PanelPopup]:{layer: LayerType.PopUp, prefab: "prefab/PanelPopup",uiclass: "PanelPopupMgr",handle:"bundleA"},
    [UIID.Tetris]:{layer: LayerType.UI, prefab: "prefab/Tetris",uiclass: "TetrisMgr",handle:"bundleA"},
    [UIID.GamePopup]:{layer: LayerType.PopUp, prefab: "prefab/GamePopup",uiclass: "GamePopupMgr",handle:"bundleA"},
    [UIID.ColorList]:{layer: LayerType.UI, prefab: "prefab/ColorList",uiclass: "ColorListMgr",handle:"bundleA"},
    [UIID.WaitingMatch]:{layer: LayerType.PopUp, prefab: "prefab/WaitingMatch",uiclass: "WaitingMatchMgr",handle:"bundleA"},
    [UIID.GameLogin]:{layer: LayerType.PopUp, prefab: "prefab/GameLogin",uiclass: "GameLoginMgr",handle:"bundleA"},
}


