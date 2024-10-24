import { _decorator, color, Component, Node } from 'cc';
import { SVGUtil } from './util/SVGUtil';
import { Area, Command, SVGData } from './data/SVGData';
import { Const } from './const/SVGConst';
const { ccclass, property } = _decorator;

@ccclass('SVGPraser')
export class SVGPraser extends Component {
    static parsePath (command, configuration) {
        let pathArray = command.params.replace(/\s*([poiuytrwqasdfghjklmnbvcxzPOIUYTREWQASDFGHJKLMNBVCXZ])\s*/g, "\n$1")
                              .replace(/,/g, " ")
                              .replace(/-/g, " -")
                              .replace(/ +/g, " ")
                              .replace(/e /g, "e")
                              .split("\n");
    
        let areaArray = [];
        let strokeArray = [];
        let areaStrokeArray = [];
        let lastM = 1;
        let closePathIndexArray = [];
        for (let i = 1; i < pathArray.length; i++) {
            let instruction = pathArray[i];
            let cmd = instruction.substr(0, 1);
            let terms = (instruction.length > 1 ? instruction.substr(1).trim().split(" ") : "");
            if(cmd == "m" || cmd == "M") {
                let preCount = strokeArray.length;
                SVGUtil.Util.M(i, lastM, cmd, terms, configuration, strokeArray);
                lastM = strokeArray.length - (strokeArray.length - preCount - 1); //  Mx,x,x,x,x,x,x,x
                if (i > 1) {
                    closePathIndexArray.push(lastM - 1);
                }
            }
            else if(cmd == "l" || cmd == "L") {
                SVGUtil.Util.L(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "h" || cmd == "H") {
                SVGUtil.Util.H(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "v" || cmd == "V") {
                SVGUtil.Util.V(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "c" || cmd == "C") {
                SVGUtil.Util.C(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "s" || cmd == "S") {
                SVGUtil.Util.S(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "q" || cmd == "Q") {	
                SVGUtil.Util.Q(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "t" || cmd == "T") {	
                SVGUtil.Util.T(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "a" || cmd == "A") {	
                SVGUtil.Util.A(i, cmd, terms, configuration, strokeArray);
            }
            else if(cmd == "z" || cmd == "Z") {
                SVGUtil.Util.Z(i, lastM, cmd, terms, configuration, strokeArray);
                //
                if (!command.fillColor) {
                    command.fillColor = color(0, 0, 0, 255);
                }
            }
        }
        SVGUtil.Util.Last(lastM, configuration, strokeArray);
        closePathIndexArray.push(strokeArray.length);
        command.closePathIndexArray = closePathIndexArray;
        //
        let fromIndex = 0;
        let toIndex = 0;
        for (var i = 0; i < closePathIndexArray.length; i ++) {
            let areaStrokeArray = [];
            toIndex = closePathIndexArray[i];
            for (let j = fromIndex; j < toIndex; j ++) {
                let stroke = strokeArray[j];
                areaStrokeArray.push(stroke);
            }
            let areaObject = new Area(areaStrokeArray);
            command.areaArray.push(areaObject);
            command.areaCount += 1;
            command.strokeCount += (areaStrokeArray.length);
            fromIndex = toIndex;
        }
    };

    static parseHZWriterJSON(json, configuration) {
        let svgRoot = {commandArray:[],pathCount:0}
        for (var i = 0; i < json["strokes"].length; i++) {
            let command = new Command();
            command.params = json["strokes"][i];
            command.type = Const.PATH;
            command.median = [];
    
            for (var j = 0; j < json["medians"][i].length - 1; j += 1) {
                let array = SVGUtil.Util.FromMedians(
                    json["medians"][i][j][0],
                    json["medians"][i][j][1],
                    json["medians"][i][j + 1][0],
                    json["medians"][i][j + 1][1],
                    6
                );
                if (j > 0) {
                    array.shift();
                }
                command.median = command.median.concat(array);
            }
            svgRoot.commandArray.push(command);
        }
    
        for (var i = 0; i < svgRoot.commandArray.length; i++) {
            let command = svgRoot.commandArray[i];
            if (command.type ==Const.PATH) {
                this.parsePath(command, configuration);
            }
        }
        svgRoot.pathCount = svgRoot.commandArray.length;
        return svgRoot;
    };
}


