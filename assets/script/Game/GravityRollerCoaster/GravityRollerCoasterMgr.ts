import { _decorator, bezier, color, Component, EditBox, Graphics, Label, Node, Size, tween, Tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';

import HanziWriter from 'hanzi-writer';
import { SVGUtil } from './svg/util/SVGUtil';
import { SVGPraser } from './svg/SVGPraser';

import { getChineseCharacterMeaning } from './ChineseCharacter';
import { EventType } from '../../TestMain';
import { EventMgr } from '../../frame/EventMgr';

import { LayerManager } from '../../frame/LayerManager';
import { UIID } from '../../main/ViewConfig';
import { InsMgr } from '../../frame/InsMgr';

/**
 * 1.字的意思 √
 * 2.字的读音 √
 * 3.字的英文 
 * 4.字的书写 √
 * 5.字的组词 
 * 6.子的造句
 * 7.成语接龙
 * 
 * 
 * 
*/

const { ccclass, property } = _decorator;

@ccclass('GravityRollerCoasterMgr')
export class GravityRollerCoasterMgr extends Component {
  private ctx: Graphics;
  private wirte: Graphics;
  private _gridRender: Graphics;
  private configuration: any;
  private segments: number = 6;
  private flipX: boolean = false;
  private flipY: boolean = false;
  private offset: Vec2;
  private __dataScale: number = 1;
  private _medianIndex: number = 0;
  commandArray: any[];
  private _commandIndex: number;
  writePoints: Graphics;
  showGrid: boolean = true;
  showFrame: boolean = true;
  gridLength: number = 4;
  _framePadding: number = 20;
  _frameRender: Graphics;
  wenData: any = null;
  retryMedian:boolean=false;
  init(data?) {
    InsMgr.tool.reBtnCall(this.node.getChildByName("reBtn"));
    this.ctx = this.node.getChildByName("graphics").getComponent(Graphics);
    this.wirte = this.node.getChildByName("graphicsWrite").getComponent(Graphics);
    this._gridRender = this.node.getChildByName("gridRender").getComponent(Graphics);
    this.writePoints = this.node.getChildByName("graphicsWritePoints").getComponent(Graphics);
    this._frameRender = this.node.getChildByName("frameRender").getComponent(Graphics);
    let editbox = this.node.getChildByName("editbox").getComponent(EditBox)
    let btn = this.node.getChildByName("parse_btn")
    let layout = this.node.getChildByName("layout");
    let clear_btn = layout.getChildByName("clear_btn");
    let stop_btn = layout.getChildByName("stop_btn");
    let stop_label = stop_btn.getChildByName("Label").getComponent(Label);
    let ci_btn = layout.getChildByName("ci_btn");
    let stopstatus = true;
    let stopenum = ["暂停", "继续"];
    let startstatus = false;
    let tempDataItem=null;
    btn.on('click', () => {
      let data = editbox.string;
      if (data.length == 0) {
        alert("不能为空");
        return;
      }
      if (!InsMgr.tool.isChineseCharacter(data)) {
        alert(data + "不是一个中文");
        return;
      }
      this.wenData = data;
      tempDataItem=null;
      this.clearGraphics();
      this.svgParse({ title: data })
      startstatus=true;
    });

    clear_btn.on('click', () => {
      this.clearGraphics();
      startstatus=false;
    });
    stop_btn.on('click', () => {
      if (!startstatus) {
        alert("请先开始解析");
        return;
      }
      if (stopstatus) {
        stop_label.string = stopenum[1];
        this.unschedule(this.autoStroke);
      } else {
        stop_label.string = stopenum[0];
        this.schedule(this.autoStroke, 0.02);
      }
      stopstatus = !stopstatus;
    });


  
    ci_btn.on('click', () => {
      if(tempDataItem){
       InsMgr.layer.show(UIID.PanelPopup, tempDataItem);
      }
      if (this.wenData == null) return;
      getChineseCharacterMeaning(this.wenData).then((result) => {
        let tempData = result["data"];
        for (let i = 0; i < tempData.length; i++) {
          tempDataItem=tempData[i]
          InsMgr.layer.show(UIID.PanelPopup, tempDataItem);
        }
      }).catch(() => {
        console.error("获取文字数据失败");
      })
    });
    this.initSvgData();
    this.drawGrid();
    this.drawFrame();

  }

  initSvgData() {
    this.offset = null;
    this.configuration = {
      "segments": this.segments,
      "flipX": (this.flipX === null ? false : this.flipX),
      "flipY": (this.flipY === null ? false : this.flipY),
      "offset": this.offset ? this.offset : v2(0, 0),
      "dataScale": (this.__dataScale === null ? 1.0 : this.__dataScale)
    };
    this.offset = this.configuration.offset = v2(500, 500);
  }

  /**
 * 清除绘图上下文和相关数据
 * 
 * 此方法用于清除当前绘图上下文中的所有内容，以及重置写入点集合和写入缓冲区
 * 同时取消定时调用的自动描边操作它帮助在绘图应用程序中重置或清理画布
 */
  clearGraphics() {
    this.ctx.clear();
    this.writePoints.clear();
    this.wirte.clear();
    this.unschedule(this.autoStroke);
  }


  /**
   * 解析SVG格式的汉字数据并绘制到画布上
   * @param {Object} row - 包含要绘制的汉字信息的对象
   */
  svgParse(row) {
    this.ctx.clear();
    HanziWriter.loadCharacterData(row.title).then((charData: any) => {
      let strokes = SVGPraser.parseHZWriterJSON(charData, this.configuration);
      this.ctx.clear();
      this.commandArray = strokes.commandArray
      for (var i = 0; i < strokes.commandArray.length; i++) {
        let command = strokes.commandArray[i];
        for (var j = 0; j < command.areaArray.length; j++) {
          let area = command.areaArray[j];
          for (var k = 0; k < area.strokeArray.length; k++) {
            SVGUtil.Util.draw(this.ctx, area.strokeArray[k], this.configuration, false);
          }
        }
        // 画点
        let offset = v2(0, 0);
        for (let n = 0; n < command.median.length; n++) {
          let _median = command.median[n];
          let x = (this.flipX ? -_median[0] * this.configuration.dataScale + offset.x : _median[0] * this.configuration.dataScale - this.offset.x);
          let y = (this.flipY ? -_median[1] * this.configuration.dataScale + offset.y : _median[1] * this.configuration.dataScale - this.offset.y);
          this.writePoints.circle(x, y, 2);
          this.writePoints.stroke();
        }
      }
      // 自动写字
      this._commandIndex = 0;
      this._medianIndex = 0;
      this.schedule(this.autoStroke, 0.02);

    }).catch((e) => {
      alert("本程序的资源字库没有此文字");
    })
  }

  /**
 * 自动描边函数
 * 该函数通过逐步增加描边的索引来绘制图形的轮廓
 */
  autoStroke() {
    this._medianIndex += 1;
    let offset = v2(0, 0);
    let command = this.commandArray[this._commandIndex]
    let _median = command.median[this._medianIndex - 1];
    let x = (this.flipX ? -_median[0] * this.configuration.dataScale + offset.x : _median[0] * this.configuration.dataScale - this.offset.x);
    let y = (this.flipY ? -_median[1] * this.configuration.dataScale + offset.y : _median[1] * this.configuration.dataScale - this.offset.y);
    if (this._medianIndex == 1) {
      this.wirte.moveTo(x, y);
    } else {
      this.wirte.lineTo(x, y);
      this.wirte.stroke();
    }
    if (this._medianIndex >= command.median.length) {
      if(this.retryMedian){
        this._medianIndex = 0;
        this.wirte.clear();
      }else{
        this._commandIndex += 1;
        if (this._commandIndex >= this.commandArray.length) {
          this.wirte.clear();
          this._medianIndex = 0;
          this._commandIndex = 0;
          console.log("所有笔划结束");
        } else {
          console.log("切换到下一笔", this._commandIndex);
          this._medianIndex = 0;
        }
      }
    }
  }

  

  // 绘制汉字的轮廓
  drawFrame() {
    if (!this._frameRender) {
      return;
    }
    this._frameRender.clear();
    //
    const orderNum = 30
    const conSize = new Size(this.node.getComponent(UITransform).contentSize.width - orderNum, this.node.getComponent(UITransform).contentSize.height - orderNum)
    let max = Math.max(conSize.width, conSize.height) + this._framePadding;
    if (this.showFrame) {
      this._frameRender.rect(-max / 2, -max / 2, max, max);
      this._frameRender.stroke();
    }
  }
  // 绘制汉字的网格线
  drawGrid() {
    if (!this._gridRender) {
      return;
    }
    this._gridRender.clear();
    const orderNum = 30
    const conSize = new Size(this.node.getComponent(UITransform).contentSize.width - orderNum, this.node.getComponent(UITransform).contentSize.height - orderNum)
    let max = Math.max(conSize.width, conSize.height) + this._framePadding;
    if (this.showGrid) {
      let segments = max / this.gridLength;
      let valline = 4
      for (var i = 0; i < segments; i += valline) {
        this._gridRender.moveTo(-max / 2 + this.gridLength * i, 0);
        if (i + 1 > segments) {
          this._gridRender.lineTo(max / 2, 0);
        }
        else {
          this._gridRender.lineTo(-max / 2 + this.gridLength * (i + 1), 0);
        }
      }
      for (var i = 0; i < segments; i += valline) {
        this._gridRender.moveTo(0, -max / 2 + this.gridLength * i);
        if (i + 1 > segments) {
          this._gridRender.lineTo(0, max / 2);
        }
        else {
          this._gridRender.lineTo(0, -max / 2 + this.gridLength * (i + 1));
        }
      }
      for (var i = 0; i < segments; i += valline) {
        this._gridRender.moveTo(-max / 2 + this.gridLength * i, -max / 2 + this.gridLength * i);
        if (i + 1 > segments) {
          this._gridRender.lineTo(max / 2, max / 2);
        }
        else {
          this._gridRender.lineTo(-max / 2 + this.gridLength * (i + 1), -max / 2 + this.gridLength * (i + 1));
        }
      }
      for (var i = 0; i < segments; i += valline) {
        this._gridRender.moveTo(-max / 2 + this.gridLength * i, max / 2 - this.gridLength * i);
        if (i + 1 > segments) {
          this._gridRender.lineTo(max / 2, -max / 2);
        }
        else {
          this._gridRender.lineTo(-max / 2 + this.gridLength * (i + 1), max / 2 - this.gridLength * (i + 1));
        }
      }
      this._gridRender.stroke();
    }
  }


}



