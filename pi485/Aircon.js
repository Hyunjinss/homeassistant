const util = require("./util.js");
const constant = require("./const.js");

class Aircon {
    #deviceId;
    #status;
    #mode;
    #swing;
    #flow;
    #targetTemp;
    #currentTemp;
    #pipe1Temp;
    #pipe2Temp;
    #outsideTemp;

    constructor(strFrame){
        let arrReceived = util.strToArray(strFrame);
        this.#deviceId = arrReceived[4]+'';

        // 상태
        this.#status = constant.MODE.getStatus(arrReceived[1]);

        // 모드
        this.#mode = constant.MODE.getMode(arrReceived[6]);
        this.#swing = constant.MODE.getSwing(arrReceived[6]);
        this.#flow = constant.MODE.getFlow(arrReceived[6]);

        // 설정온도
        this.#targetTemp = (arrReceived[7]+15)+'';

        // 현재온도
        let currentTemp = arrReceived[8];
        this.#currentTemp = ((0x40 - currentTemp/3).toFixed(1));

        // 냉매배관온도1,2
        let pipe1Temp = arrReceived[9];
        this.#pipe1Temp = ((0x40 - pipe1Temp/3).toFixed(1));
        let pipe2Temp = arrReceived[10];
        this.#pipe2Temp = ((0x40 - pipe2Temp/3).toFixed(1));

        // 실외기온도
        let outsideTemp = arrReceived[11];
        this.#outsideTemp = ((0x40 - outsideTemp/3).toFixed(1));
    }

    get deviceId(){ return this.#deviceId; }
    get mode(){
        if( this.#status === 'off' ) return 'off';

        return this.#mode;
    }
    get swing(){ return this.#swing; }
    get flow(){ return this.#flow; }
    get targetTemp(){ return this.#targetTemp; }
    get currentTemp(){ return this.#currentTemp; }
    get pipe1Temp(){ return this.#pipe1Temp; }
    get pipe2Temp(){ return this.#pipe2Temp; }
    get outsideTemp(){ return this.#outsideTemp; }

    set mode(mode){
        if( mode === 'off' ){
            this.#status = 'off';
        }else{
            this.#status = 'on';
            this.#mode = mode;
        }
    }
    set swing(swing){ this.#swing = swing; }
    set flow(flow){ this.#flow = flow; }
    set targetTemp(targetTemp){ this.#targetTemp = targetTemp; }
    set currentTemp(currentTemp){ this.#currentTemp = currentTemp; }
    set pipe1Temp(pipe1Temp){ this.#pipe1Temp = pipe1Temp; }
    set pipe2Temp(pipe2Temp){ this.#pipe2Temp = pipe2Temp; }
    set outsideTemp(outsideTemp){ this.#outsideTemp = outsideTemp; }

    get json() {
        return {
            deviceId : this.#deviceId,
            mode : this.#status === 'off' ? 'off' : this.#mode,
            swing : this.#swing,
            flow : this.#flow,
            targetTemp : this.#targetTemp,
            currentTemp : this.#currentTemp,
            pipe1Temp : this.#pipe1Temp,
            pipe2Temp : this.#pipe2Temp,
            outsideTemp : this.#outsideTemp
        }
    }

    get packet() {
        let p = '8000A3'

        // device id
        p += this.#deviceId.padStart(2,'0');

        // 작동상태
        p += constant.MODE.getStatus(this.#status).padStart(2, '0');

        // 풍량(4자리), 풍향(1자리), 운전모드(3자리) 각 2진수를 나열해서 16진수로 변환
        let binText = constant.MODE.getFlowBin(this.#flow)
                + constant.MODE.getSwingBin(this.#swing)
                + constant.MODE.getModeBin(this.#mode);
        p += parseInt(binText,2).toString(16).padStart(2,'0');

        // 온도 : (실제값 - 15)을 16진수로
        p += (this.#targetTemp-15).toString(16).padStart(2,'0');

        // 체크섬
        let checksum = util.getXorSumDecValue(p).toString(16).padStart(2, '0');
        p += checksum;


        return p;
    }
}


module.exports = Aircon;

