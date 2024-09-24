
export class SVGData {
    strokeArray: any;
    strokeCount: any;
    isFinished: boolean;
    type: number;
    fillColor: null;
    strokeColor: null;
    strokeWidth: null;
    areaCount: number;
    areaArray: any[];
    params: null;
    commandArray: any[];
    commandType: any;
    renderType: any;
    dataArray: any;
    instrunction: any;
    private static svgData = null;
   public static get Data() {
        if (this.svgData === null) {
            this.svgData = new SVGData();
        }
        return this.svgData
    }
    clear() {
        if (SVGData.Data.svgData) {
            delete SVGData.Data.svgData;
        }
    }
    Area(strokeArray) {
        this.strokeArray = strokeArray;
        this.strokeCount = strokeArray.length;
        this.isFinished = false;
    }

   

  

   


}

export class Area{
    strokeArray:any;
    strokeCount: any;
    isFinished;

    constructor(strokeArray){
        this.strokeArray=strokeArray;
        this.strokeCount = this.strokeArray.length;
        this.isFinished = false;
    }

}

export class  Command {
     type = 0; // 
     fillColor = null;
     strokeColor = null;
     strokeWidth = null;
     areaArray = [];
     areaCount = 0;
     strokeCount = 0;
     params = null;
     isFinished = false;
    median: any[];


}
export class  Stroke{
    commandType: any;
    renderType: any;
    dataArray: any;
    instrunction: any;
    params: any;
    isFinished: boolean;
    constructor(commandType, renderType, instrunction, params, dataArray) {
        this.commandType = commandType;
        this.renderType = renderType;
        this.dataArray = dataArray || [];
        this.instrunction = instrunction;
        this.params = params || {};
        this.isFinished = false;
    };
}
