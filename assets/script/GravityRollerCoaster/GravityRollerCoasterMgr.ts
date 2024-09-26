import { _decorator, bezier, color, Component, EditBox, Graphics, Label, Node, tween, Tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { EventMgr } from '../test/EventMgr';
import { config, EventType } from '../TestMain';
import HanziWriter from 'hanzi-writer';
import { SVGUtil } from './svg/util/SVGUtil';
import { SVGPraser } from './svg/SVGPraser';
import { Const } from './svg/const/SVGConst';
import { GridSpace } from '../There/ConstValue';
import { mayThrowError, ToolHelper } from '../ToolHelper/ToolHelper';
import cnchar from 'cnchar';

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
  init(data?) {
    let reBtn = this.node.getChildByName("reBtn");
    reBtn.on("click", () => {
      EventMgr.Instance.displayer(EventType.GameEnd, {
        page: config.GravityRollerCoaster
      });
    })

    this.ctx = this.node.getChildByName("graphics").getComponent(Graphics);
    this.wirte = this.node.getChildByName("graphicsWrite").getComponent(Graphics);
    this.writePoints = this.node.getChildByName("graphicsWritePoints").getComponent(Graphics);
    let editbox = this.node.getChildByName("editbox").getComponent(EditBox)
    let btn = this.node.getChildByName("parse_btn")
    let layout = this.node.getChildByName("layout");
    let clear_btn = layout.getChildByName("clear_btn");
    let stop_btn = layout.getChildByName("stop_btn");
    let stop_label = stop_btn.getChildByName("Label").getComponent(Label);
    let allauto_btn = layout.getChildByName("allauto_btn")
    let selfauto_btn = layout.getChildByName("selfauto_btn")
    let stopstatus = true;
    let stopenum = ["暂停", "继续"];
    let startstatus = false;
    btn.on('click', () => {
      let data = editbox.string;
      if (data.length == 0) {
        alert("不能为空");
        return;
      }
      if (!ToolHelper.isChineseCharacter(data)) {
        alert(data + "不是一个中文");
        return;
      }
      this.clearSvg();
      this.svg({ title: data })
      
      getChineseCharacterMeaning(data).then((result) => {
        let tempData = result["data"];
        console.log("tempData:", tempData);
        for (let i = 0; i < tempData.length; i++) {
          let { explanation } = tempData[i];
          console.log("result", explanation);
        }
      }).catch(() => {
        console.error("获取文字数据失败");
      })
    });

    clear_btn.on('click', () => {
      this.clearSvg();
    });
    stop_btn.on('click', () => {
      if (!startstatus) {
        alert("请先开始解析");
        return;
      }
      if (stopstatus) {
        stop_label.string = stopenum[1];
        this.unschedule(this.tempDrawAnim);
      } else {
        stop_label.string = stopenum[0];
        this.schedule(this.tempDrawAnim, 0.02);
      }
      stopstatus = !stopstatus;
    });

    allauto_btn.on('click', () => {
      startstatus = true;
      this.schedule(this.tempDrawAnim, 0.02);
    });
    selfauto_btn.on('click', () => {
      new mayThrowError("暂未实现");
    });
    this.initSvgData();
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

  clearSvg() {
    this.ctx.clear();
    this.writePoints.clear();
    this.wirte.clear();
    this.unschedule(this.tempDrawAnim);
  }



  svg(row) {
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
    }).catch((e) => {
      alert("本程序的资源字库没有此文字");
    })
  }
  tempDrawAnim() {
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

/**
 * 后续可能有次数限制现在免费
 * 不开放
 * 
*/
async function getChineseCharacterMeaning(character: string): Promise<Object> {
  return null;
  const apiUrl = `https://www.mxnzp.com/api/convert/dictionary?content=${character}&app_id=7glvhnoagbxienof&app_secret=w6qF9nl3HIOS2dvMIpdMJ8ESXI9W28fv`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`网络错误：${response.status} - ${response.statusText}`);
  }
  const data = await response.json();
  if (data.code) {

    return data;
  } else {
    return "没有找到意思";
  }
}

