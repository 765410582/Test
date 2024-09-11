
export class TrafficLight  {
    private light:any;
    private _currentIndex: number;
    private _time:number;
    constructor(_light) {
        this.light = _light;
        this._currentIndex = 0;
        this._time = Date.now()
          // 初始化日志
          console.log(`LightManager created at ${new Date(this._time).toISOString()}`);
    }
    _update() {
        let loopCount=0;
        const maxLoopCount=1000;//设置最大循环次数
        while (loopCount<maxLoopCount) {
            loopCount++;
            if (this._disTime() <= this._currectLigth.last) {
                break;
            }
            this._time += this._currectLigth.last;
            this._currentIndex = (this._currentIndex + 1) % this.light.length;
        }
        if(loopCount>=maxLoopCount){
            throw new Error("循环次数过多，可能存在死循环");
        }
    }
    get _currectLigth() {
        return this.light[this._currentIndex];
    }

    _disTime() {
        return Date.now() - (this._time)
    }

    getTrafficLight() {
        this._update();
        return { color: this._currectLigth.color, reman: this._currectLigth.last - this._disTime() };
    }
}


