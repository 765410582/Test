import { _decorator, color, Component, macro, misc, Node, v2, Vec2 } from 'cc';
import { Const } from '../const/SVGConst';
import { Stroke, SVGData } from '../data/SVGData';
const { ccclass, property } = _decorator;

@ccclass('SVGUtilPath')
export class SVGUtil extends Component {


    private static svgData = null;
    public static get Util() {
        if (this.svgData === null) {
            this.svgData = new SVGUtil();
        }
        return this.svgData
    }


    //----------------------------------------SVGUtilPath-------------------------------------------------------------
    _checkDecimalTerms(terms: any): any {
        let outputArray = [];
        for (let i = 0; i < terms.length; i++) {
            let decimalArray = terms[i].split(".");
            if (decimalArray.length > 1) {
                outputArray.push(parseFloat((decimalArray[0] ? decimalArray[0] : "0") + "." + decimalArray[1]));
                //
                for (let j = 2; j < decimalArray.length; j++) {
                    outputArray.push(parseFloat("0." + decimalArray[j]));
                }
            }
            else {
                outputArray.push(parseFloat(terms[i]));
            }
        }
        return outputArray;
    }


    _fuzzyEquals(param1, param2, variance) {
        if (param1.x - variance <= param2.x && param2.x <= param1.x + variance) {
            if (param1.y - variance <= param2.y && param2.y <= param1.y + variance) {
                return true;
            }
        }
        return false;
    }
    M(index, lastM, cmd, terms, configuration, outArray) {
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        let px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
        if (preStroke) {
            if (preStroke.commandType != Const.PATH_END) {
                let lastMStrokeobject = outArray[lastM - 1];
                if (preStroke.params.x != lastMStrokeobject.params.x || preStroke.params.y != lastMStrokeobject.params.y) {
                    // implicit l+z
                    let strokeObject1 = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + "(l)", { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
                    outArray.push(strokeObject1);
                    let strokeObject2 = new Stroke(Const.PATH_END, Const.RENDER_CLOSE, cmd + "(z)", { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
                    outArray.push(strokeObject2);
                }
                else {
                    // implicit m+z
                    let strokeObject = new Stroke(Const.PATH_END, Const.RENDER_CLOSE, cmd + "(z)", { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
                    outArray.push(strokeObject);
                }
            }
            else {
                preStroke.renderType = Const.RENDER_CLOSE;
            }
        }
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i < terms.length / 2; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let x = parseFloat(terms[i * 2]), y = parseFloat(terms[i * 2 + 1]);
            if (cmd == "m") {
                x += px, y += py;
            }
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            if (i == 0) {
                let strokeObject = new Stroke(Const.PATH_MOVE, Const.RENDER_MOVE, cmd + " " + terms[i * 2] + " " + terms[i * 2 + 1], { "px": 0, "py": 0, "x": x, "y": y }, [{ "x": x, "y": y }]);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
            else {
                // implict lineto command
                let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + "(l) " + terms[i * 2] + " " + terms[i * 2 + 1], { "px": px, "py": py, "x": x, "y": y }, [{ "x": x, "y": y }]);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    }


    // L lineto (x y)+
    L(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i < terms.length / 2; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let x = parseFloat(terms[i * 2]), y = parseFloat(terms[i * 2 + 1]);
            if (cmd == "l") {
                x += px, y += py;
            }
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            if (configuration.segmentationOn) {
                let segmentArray = this.FromLine(px, py, x, y, configuration.segments);
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + "(*) " + segmentArray[m].x + " " + segmentArray[m].y, { "px": segmentArray[m - 1].x, "py": segmentArray[m - 1].y, "x": x, "y": y }, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + " " + terms[i * 2] + " " + terms[i * 2 + 1], { "px": px, "py": py, "x": x, "y": y }, [{ "x": x, "y": y }]);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // H horizontal lineto x+
    H(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i <= terms.length - 1; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let x = parseFloat(terms[i]);
            let y = py;
            if (cmd == "h") {
                x += px;
            }
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            if (configuration.segmentationOn) {
                let segmentArray = this.FromLine(px, py, x, y, configuration.segments);
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + " " + x + "(" + m + ")", { "px": segmentArray[m - 1].x, "py": segmentArray[m - 1].y, "x": x, "y": y }, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + " " + x, { "px": px, "py": py, "x": x, "y": y }, [{ "x": x, "y": y }]);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // V vertical lineto y+
    V(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i <= terms.length - 1; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let x = px;
            let y = parseFloat(terms[i]);
            if (cmd == "v") {
                y += py;
            }
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            if (configuration.segmentationOn) {
                let segmentArray = this.FromLine(px, py, x, y, configuration.segments);
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + " " + y + "(" + m + ")", { "px": segmentArray[m - 1].x, "py": segmentArray[m - 1].y, "x": x, "y": y }, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + " " + y, { "px": px, "py": py, "x": x, "y": y }, [{ "x": x, "y": y }]);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // C curveto (x1 y1 x2 y2 x y)+
    C(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        terms = this._checkDecimalTerms(terms);
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        for (let i = 0; i < terms.length / 6; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let cx1 = parseFloat(terms[i * 6]), cy1 = parseFloat(terms[i * 6 + 1]);
            let cx2 = parseFloat(terms[i * 6 + 2]), cy2 = parseFloat(terms[i * 6 + 3]);
            let x = parseFloat(terms[i * 6 + 4]), y = parseFloat(terms[i * 6 + 5]);
            //
            if (cmd == "c") {
                cx1 += px, cy1 += py;
                cx2 += px, cy2 += py;
                x += px, y += py
            }
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            cx1 = parseFloat(cx1.toFixed(3));
            cy1 = parseFloat(cy1.toFixed(3));
            cx2 = parseFloat(cx2.toFixed(3));
            cy2 = parseFloat(cy2.toFixed(3));
            //
            let instruction = cmd + " " + terms[i * 6] + " " + terms[i * 6 + 1] + " " + terms[i * 6 + 2] + " " + terms[i * 6 + 3] + " " + terms[i * 6 + 4] + " " + terms[i * 6 + 5];
            let params = { "px": px, "py": py, "cx1": cx1, "cy1": cy1, "cx2": cx2, "cy2": cy2, "x": x, "y": y };
            //
            let segmentArray = this.FromCubicBezier(px, py, cx1, cy1, cx2, cy2, x, y, configuration.segments);
            if (configuration.segmentationOn) {
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, instruction + "(" + m + ")", params, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_CURVE_C, Const.RENDER_POLYLINE, instruction, params, segmentArray);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // S smooth curveto	(x2 y2 x y)+
    S(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i < terms.length / 4; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let cx2 = parseFloat(terms[i * 4]), cy2 = parseFloat(terms[i * 4 + 1]);
            if (cmd == "s") {
                cx2 = px + cx2, cy2 = py + cy2;
            }
            let cx1 = px, cy1 = py;
            if (preStroke.commandType == Const.PATH_CURVE_C ||
                preStroke.commandType == Const.PATH_CURVE_S) {
                cx1 = 2 * px - preStroke.params.cx2;
                cy1 = 2 * py - preStroke.params.cy2;
            }
            let x = parseFloat(terms[i * 4 + 2]), y = parseFloat(terms[i * 4 + 3]);
            if (cmd == "s") {
                x += px, y += py;
            }
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            cx1 = parseFloat(cx1.toFixed(3));
            cy1 = parseFloat(cy1.toFixed(3));
            cx2 = parseFloat(cx2.toFixed(3));
            cy2 = parseFloat(cy2.toFixed(3));
            //
            let instruction = cmd + " " + terms[i * 4] + " " + terms[i * 4 + 1] + " " + terms[i * 4 + 2] + " " + terms[i * 4 + 3];
            let params = { "px": px, "py": py, "cx1": cx1, "cy1": cy1, "cx2": cx2, "cy2": cy2, "x": x, "y": y };
            //
            let segmentArray = this.FromCubicBezier(px, py, cx1, cy1, cx2, cy2, x, y, configuration.segments);
            if (configuration.segmentationOn) {
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, instruction + "(" + m + ")", params, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_CURVE_S, Const.RENDER_POLYLINE, instruction, params, segmentArray);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // Q Quadratic Bézier curveto (x1 y1 x y)+
    Q(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i < terms.length / 4; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let cx1 = parseFloat(terms[i * 4]), cy1 = parseFloat(terms[i * 4 + 1]);
            if (cmd == "q") {
                cx1 += px, cy1 += py;
            }
            let x = parseFloat(terms[i * 4 + 2]), y = parseFloat(terms[i * 4 + 3]);
            if (cmd == "q") {
                x += px, y += py;
            }
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            cx1 = parseFloat(cx1.toFixed(3));
            cy1 = parseFloat(cy1.toFixed(3));
            //
            let instruction = cmd + " " + terms[i * 4] + " " + terms[i * 4 + 1] + " " + terms[i * 4 + 2] + " " + terms[i * 4 + 3];
            let params = { "px": px, "py": py, "cx1": cx1, "cy1": cy1, "x": x, "y": y };
            //
            let segmentArray = this.FromQuadBezier(px, py, cx1, cy1, x, y, configuration.segments);
            if (configuration.segmentationOn) {
                for (var m = 0; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, instruction + "(" + m + ")", params, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_CURVE_Q, Const.RENDER_POLYLINE, instruction, params, segmentArray);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // T smooth quadratic Bézier curveto (x y)+
    T(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i < terms.length / 2; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            let x = parseFloat(terms[i * 2]), y = parseFloat(terms[i * 2 + 1]);
            if (cmd == "t") {
                x += px, y += py;
            }
            let cx1 = px, cy1 = py;
            if (preStroke.commandType == Const.PATH_CURVE_Q ||
                preStroke.commandType == Const.PATH_CURVE_T) {
                cx1 = 2 * px - preStroke.params.cx1;
                cy1 = 2 * py - preStroke.params.cy1;
            }
            //
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            cx1 = parseFloat(cx1.toFixed(3));
            cy1 = parseFloat(cy1.toFixed(3));
            //
            let instruction = cmd + " " + terms[i * 2] + " " + terms[i * 2 + 1];
            let params = { "px": px, "py": py, "cx1": cx1, "cy1": cy1, "x": x, "y": y };
            //
            let segmentArray = this.FromQuadBezier(px, py, cx1, cy1, x, y, configuration.segments);
            if (configuration.segmentationOn) {
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, instruction + "(" + m + ")", params, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_CURVE_T, Const.RENDER_POLYLINE, instruction, params, segmentArray);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // A elliptical arc (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
    A(index, cmd, terms, configuration, outArray) {
        let px = 0, py = 0;
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        terms = this._checkDecimalTerms(terms);
        for (let i = 0; i < terms.length / 7; i++) {
            px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
            //
            let rx = parseFloat(terms[i * 7]), ry = parseFloat(terms[i * 7 + 1]), rotate = parseFloat(terms[i * 7 + 2]);
            let largeArcFlag = parseFloat(terms[i * 7 + 3]), sweepFlag = parseFloat(terms[i * 7 + 4]);
            let x = parseFloat(terms[i * 7 + 5]), y = parseFloat(terms[i * 7 + 6]);
            if (cmd == "a") {
                x += px, y += py;
            }
            //
            x = parseFloat(x.toFixed(3));
            y = parseFloat(y.toFixed(3));
            //
            let instruction = cmd + " " + terms[i * 7] + " " + terms[i * 7 + 1] + " " + terms[i * 7 + 2] + " " + terms[i * 7 + 3] + " " + terms[i * 7 + 4] + " " + terms[i * 7 + 5] + " " + terms[i * 7 + 6];
            let params = { "px": px, "py": py, "rx": rx, "ry": ry, "rotate": rotate, "largeArcFlag": largeArcFlag, "sweepFlag": sweepFlag, "x": x, "y": y };
            //
            let segmentArray = this.FromEllipticArc(px, py, rx, ry, rotate, largeArcFlag, sweepFlag, x, y, configuration.segments);
            if (configuration.segmentationOn) {
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, instruction + "(" + m + ")", params, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                    preStroke = strokeObject;
                }
            }
            else {
                let strokeObject = new Stroke(Const.PATH_CURVE_A, Const.RENDER_POLYLINE, instruction, params, segmentArray);
                outArray.push(strokeObject);
                preStroke = strokeObject;
            }
        }
    };

    // Z closepath (none)
    Z(index, lastM, cmd, terms, configuration, outArray) {
        let lastMStrokeobject = outArray[lastM - 1];
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        let px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);

        if (this._fuzzyEquals(preStroke.params, lastMStrokeobject.params, macro.FLT_EPSILON)) {
            let strokeObject = new Stroke(Const.PATH_END, Const.RENDER_CLOSE, cmd, { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
            outArray.push(strokeObject);
            preStroke = strokeObject;
        }
        else {
            if (configuration.segmentationOn) {
                let segmentArray = this.FromLine(px, py, lastMStrokeobject.params.x, lastMStrokeobject.params.y, configuration.segments);
                for (var m = 1; m < segmentArray.length; m++) {
                    let strokeObject = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, "z" + "(" + m + ")", { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": segmentArray[m].x, "y": segmentArray[m].y }]);
                    outArray.push(strokeObject);
                }
                let strokeObject2 = new Stroke(Const.PATH_END, Const.RENDER_CLOSE, cmd, { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
                outArray.push(strokeObject2);
                preStroke = strokeObject2;
            }
            else {
                let strokeObject1 = new Stroke(Const.PATH_LINE, Const.RENDER_LINE, cmd + "(l)", { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }]);
                outArray.push(strokeObject1);
                let strokeObject2 = new Stroke(Const.PATH_END, Const.RENDER_CLOSE, cmd, { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
                outArray.push(strokeObject2);
                preStroke = strokeObject2;
            }
        }
    };

    // check last implict z
    Last(lastM, configuration, outArray) {
        let preStroke = (outArray.length > 0 ? outArray[outArray.length - 1] : null);
        if (preStroke.commandType == Const.PATH_END) {
            return;
        }
        let px = (preStroke ? preStroke.params.x : 0), py = (preStroke ? preStroke.params.y : 0);
        let lastMStrokeobject = outArray[lastM - 1];
        if (this._fuzzyEquals(lastMStrokeobject.params, preStroke.params, macro.FLT_EPSILON)) {
            let strokeObject = new Stroke(Const.PATH_END, Const.RENDER_CLOSE, "(z)", { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
            outArray.push(strokeObject);
        }
        else {
            let strokeObject = new Stroke(Const.PATH_END, Const.RENDER_END, "(z)", { "px": px, "py": py, "x": lastMStrokeobject.params.x, "y": lastMStrokeobject.params.y }, [{ "x": preStroke.params.x, "y": preStroke.params.y }]);
            outArray.push(strokeObject);
        }
    };


    //----------------------------------------SVGPolylineUtil-------------------------------------------------------------

    FromCubicBezier(px, py, cx1, cy1, cx2, cy2, x, y, segments) {
        let outputArray = [];
        let t = 1.0 / segments;
        for (let i = t; i < 1; i += t) {
            let xx = Math.pow(1 - i, 3) * px + 3.0 * Math.pow(1 - i, 2) * i * cx1 + 3.0 * (1 - i) * i * i * cx2 + i * i * i * x;
            let yy = Math.pow(1 - i, 3) * py + 3.0 * Math.pow(1 - i, 2) * i * cy1 + 3.0 * (1 - i) * i * i * cy2 + i * i * i * y;
            outputArray.push({ "x": parseFloat(xx.toFixed(3)), "y": parseFloat(yy.toFixed(3)) });
        }
        return outputArray;
    };

    FromQuadBezier(px, py, cx1, cy1, x, y, segments) {
        let outputArray = [];
        let t = 1.0 / segments;
        for (let i = t; i < 1; i += t) {
            let xx = Math.pow(1 - i, 2) * px + 2.0 * (1 - i) * i * cx1 + i * i * x;
            let yy = Math.pow(1 - i, 2) * py + 2.0 * (1 - i) * i * cy1 + i * i * y;
            outputArray.push({ "x": parseFloat(xx.toFixed(3)), "y": parseFloat(yy.toFixed(3)) });
        }
        return outputArray;
    };

    FromEllipticArc(x1, y1, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x2, y2, segments) {
        var phi = misc.degreesToRadians(xAxisRotation % 360);
        var cosPhi = Math.cos(phi);
        var sinPhi = Math.sin(phi);
        var halfDifX = (x1 - x2) / 2;
        var halfDifY = (y1 - y2) / 2;
        var x1p = cosPhi * halfDifX + sinPhi * halfDifY;
        var y1p = -sinPhi * halfDifX + cosPhi * halfDifY;
        var prx, pry, px1p, py1p, radiiCheck, sign, denominator, numerator, coef, cxp, cyp, halfSumX, halfSumY, cx, cy, ux, uy, vx, vy, angleStart, angleExtent;
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        prx = rx * rx;
        pry = ry * ry;
        px1p = x1p * x1p;
        py1p = y1p * y1p;
        // check that radii are large enough
        radiiCheck = px1p / prx + py1p / pry;
        if (radiiCheck > 1) {
            rx *= Math.sqrt(radiiCheck);
            ry *= Math.sqrt(radiiCheck);
            prx = rx * rx;
            pry = ry * ry;
        }
        // compute: (cx1, cy1)
        var sign: any = largeArcFlag === sweepFlag ? -1 : 1;
        var denominator: any = prx * py1p + pry * px1p;
        var numerator: any = prx * pry - denominator;
        var coef: any = numerator < 0 ? 0 : sign * Math.sqrt(numerator / denominator);

        var cxp: any = coef * (rx * y1p / ry);
        var cyp: any = coef * (-ry * x1p / rx);

        var halfSumX: any = (x1 + x2) / 2;
        var halfSumY: any = (y1 + y2) / 2;
        var cx = cosPhi * cxp - sinPhi * cyp + halfSumX;
        var cy = sinPhi * cxp + cosPhi * cyp + halfSumY;

        var ux: any = (x1p - cxp) / rx;
        var uy: any = (y1p - cyp) / ry;
        var vx: any = (-x1p - cxp) / rx;
        var vy: any = (-y1p - cyp) / ry;

        sign = uy < 0 ? -1 : 1;
        numerator = ux;
        denominator = Math.sqrt(ux * ux + uy * uy);
        var angleStart: any = misc.radiansToDegrees(sign * Math.acos(numerator / denominator));

        sign = ux * vy - uy * vx < 0 ? -1 : 1;
        numerator = ux * vx
        vx + uy * vy;
        denominator = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
        var angleExtent: any = misc.radiansToDegrees(sign * Math.acos(numerator / denominator));

        if (!sweepFlag && angleExtent > 0) {
            angleExtent -= 360;
        }
        else if (sweepFlag && angleExtent < 0) {
            angleExtent += 360;
        }
        angleExtent %= 360;
        angleStart %= 360;
        //
        let outputArray = [];
        let t = 0;
        for (let s = 1; s < segments; s++) {
            t = s / segments;
            var theta = misc.degreesToRadians(angleStart + t * angleExtent);
            var rxc = rx * Math.cos(theta);
            var rys = ry * Math.sin(theta);
            outputArray.push({ "x": (cx + cosPhi * rxc - sinPhi * rys), "y": (cy + sinPhi * rxc + cosPhi * rys) });
        }
        outputArray.push({ "x": parseFloat(x2.toFixed(3)), "y": parseFloat(y2.toFixed(3)) });
        return outputArray;
    }

    FromLine(x1, y1, x2, y2, segments) {
        let outputArray = [];
        let t = 1 / segments;
        for (var i = t; i < 1; i += t) {
            let out = v2(0, 0);
            Vec2.lerp(out, v2(x1, y1), v2(parseFloat(x2.toFixed(3)), parseFloat(y2.toFixed(3))), i);
            outputArray.push(out.x, out.y);
        }
        return outputArray;
    }

    FromMedians(x1, y1, x2, y2, segments) {
        let outputArray = [];
        if (segments == 1) {
            outputArray.push([x1, y1]);
            outputArray.push([x2, y2]);
            return outputArray;
        }
        let t = 1 / segments;
        for (var i = 0; i <= 1; i += t) {
            let out = v2(0, 0);
            Vec2.lerp(out, v2(x1, y1), v2(parseFloat(x2.toFixed(3)), parseFloat(y2.toFixed(3))), i);
            outputArray.push([parseFloat(out.x.toFixed(3)), parseFloat(out.y.toFixed(3))]);
        }
        return outputArray;
    }


    //----------------------------------------SVGUtilRender-------------------------------------------------------------
    draw(graphicsComponent, svgStrokeObject, configuration, skipFill, skipStroke) {
        if (svgStrokeObject.renderType == Const.RENDER_MOVE) {
            graphicsComponent.moveTo(
                (configuration.flipX ? -svgStrokeObject.dataArray[0].x * configuration.dataScale + configuration.offset.x : svgStrokeObject.dataArray[0].x * configuration.dataScale - configuration.offset.x),
                (configuration.flipY ? -svgStrokeObject.dataArray[0].y * configuration.dataScale + configuration.offset.y : svgStrokeObject.dataArray[0].y * configuration.dataScale - configuration.offset.y),
            );
        }
        else if (svgStrokeObject.renderType == Const.RENDER_CLOSE) {
            graphicsComponent.close();
            if (graphicsComponent.lineWidth > 0 || configuration.enableMergeStroke && !skipStroke) {
                graphicsComponent.stroke();
            }
            if (!configuration.enablePaintMode && !skipFill) {
                if (!graphicsComponent.fillColor) {
                    graphicsComponent.fillColor = color(0, 0, 0, 255);
                }
                if (graphicsComponent.fillColor.a > 0) {
                    graphicsComponent.fill();
                }
            }
        }
        else if (svgStrokeObject.renderType == Const.RENDER_LINE) {
            graphicsComponent.lineTo(
                (configuration.flipX ? -svgStrokeObject.dataArray[0].x * configuration.dataScale + configuration.offset.x : svgStrokeObject.dataArray[0].x * configuration.dataScale - configuration.offset.x),
                (configuration.flipY ? -svgStrokeObject.dataArray[0].y * configuration.dataScale + configuration.offset.y : svgStrokeObject.dataArray[0].y * configuration.dataScale - configuration.offset.y),
            );
            if (!configuration.enableMergeStroke && !skipStroke) {
                graphicsComponent.stroke();
            }
        }
        else if (svgStrokeObject.renderType == Const.RENDER_POLYLINE) {
            for (let i = 0; i < svgStrokeObject.dataArray.length; i++) {
                graphicsComponent.lineTo(
                    (configuration.flipX ? -svgStrokeObject.dataArray[i].x * configuration.dataScale + configuration.offset.x : svgStrokeObject.dataArray[i].x * configuration.dataScale - configuration.offset.x),
                    (configuration.flipY ? -svgStrokeObject.dataArray[i].y * configuration.dataScale + configuration.offset.y : svgStrokeObject.dataArray[i].y * configuration.dataScale - configuration.offset.y),
                );
            }
            if (!configuration.enableMergeStroke && !skipStroke) {
                graphicsComponent.stroke();
            }
        }
        else if (svgStrokeObject.renderType == Const.RENDER_END) {
            if ((graphicsComponent.lineWidth > 0 || configuration.enableMergeStroke) && !skipStroke) {
                graphicsComponent.stroke();
            }
        }
        else {
            console.log("ssr.SVG.Util.Render.draw Unknown TYPE: " + svgStrokeObject.renderType);
        }
    }
}


