import { _decorator, bezier, Component, Graphics, Node, tween, Tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { EventMgr } from '../test/EventMgr';
import { config, EventType } from '../TestMain';
import HanziWriter from 'hanzi-writer';
import { SVGUtil } from './svg/util/SVGUtil';
import { SVGPraser } from './svg/SVGPraser';


const { ccclass, property } = _decorator;

@ccclass('GravityRollerCoasterMgr')
export class GravityRollerCoasterMgr extends Component {
  private ctx: Graphics;
  private moveNode: Node;
  private configuration: any;
  private segments: number = 6;
  private flipX: boolean = false;
  private flipY: boolean = false;
  private offset: Vec2;
  private __dataScale: number = 0.2;
  init(data?) {
    console.log("GravityRollerCoasterMgr init", data);
    let reBtn = this.node.getChildByName("reBtn");
    reBtn.on("click", () => {
      EventMgr.Instance.displayer(EventType.GameEnd, {
        page: config.GravityRollerCoaster
      });
    })

    this.ctx = this.node.getChildByName("Graphics").getComponent(Graphics);
    this.moveNode = this.node.getChildByName("moveNode");
    this.offset = null;
    let winSize=this.node.getComponent(UITransform)
    
    this.configuration = {
      "segments": this.segments,
      "flipX": (this.flipX === null ? false : this.flipX),
      "flipY": (this.flipY === null ? false : this.flipY),
      "offset": this.offset ? this.offset : v2(0, 0),
      "dataScale": (this.__dataScale === null ? 1.0 : this.__dataScale)
    };
    this.offset = this.configuration.offset =v2(100, 80);
    let tempData="在中根据引线图形绘制路径数据得到路径数据给引".split("");
    let index=0;
    this.schedule(()=>{
      this.svg({title:tempData[index]});
      index=(index+1)%tempData.length;
    },10);
    

  }

  svg(row) {
    this.ctx.clear();
    HanziWriter.loadCharacterData(row.title).then((charData: any) => {
      let strokes = SVGPraser.parseHZWriterJSON(charData, this.configuration);
      this.ctx.clear();
      for (var i = 0; i < strokes.commandArray.length; i++) {
        let command = strokes.commandArray[i];
        for (var j = 0; j < command.areaArray.length; j++) {
          let area = command.areaArray[j];
          for (var k = 0; k < area.strokeArray.length; k++) {
            console.log("area.strokeArray[k]:",area.strokeArray[k]);
            SVGUtil.Util.draw(this.ctx, area.strokeArray[k], this.configuration, false);
          }
        }
      }
    })
  }
}



