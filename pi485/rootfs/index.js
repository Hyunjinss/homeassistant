let netClient = {};

const net = require('net');     // Socket
const mqtt = require('mqtt');
const Aircon = require("./Aircon");
const util = require("./util.js");
const constant = require("./const.js");





// 로그 표시
var log = (...args) => console.log('[' + new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}) + ']', args.join(' '));

//////////////////////////////////////////////////////////////////////////////////////
// MQTT-Broker 연결
//////////////////////////////////////////////////////////////////////////////////////
const client  = mqtt.connect(constant.mqttBroker,
    {clientId: constant.clientID,
         username: constant.mqttUser,
         password: constant.mqttPass});
client.on('connect', () => {
	log('mqtt connected');
});
setTimeout(() => {log('MQTT Ready...')}, constant.mqttDelay);

//////////////////////////////////////////////////////////////////////////////////
// TCP Connection 관련
//////////////////////////////////////////////////////////////////////////////////
function getConnection(connName){
	netClient = net.connect({port: constant.port, host:constant.ip}, function() {
	log(connName + ' Connected');
    this.on('data', function(hex) {
		var strFrame = hex.toString('hex');
		receive(strFrame);
        waitForReceiving = 0;
    });
    this.on('end', function() {
      console.log(connName + ' Client disconnected');
	  getConnection(connName);
    });
    this.on('error', function(err) {
      console.log(connName + ' Socket Error: ', JSON.stringify(err));
	  getConnection(connName);
    });
    this.on('timeout', function() {
      console.log(connName + ' Socket Timed Out');
	  getConnection(connName);
    });
    this.on('close', function() {
      console.log(connName + ' Socket Closed');
	  getConnection(connName);
    });
  });
}
setTimeout(function(){
	getConnection('EW11_TCP');
},500);

// 초기 에어컨 인식
let initCompleted = false;
setTimeout(function(){
    for(let i = 0; i < 4 ; i++ ){
        refreshStatusCommand(i);
    }
    sendQueue.push({type:'initCompleted'});

}, 500);

// 인식 된 에어컨 상태 조회
setInterval(function(){
    for(let i = 0 ; i < AIRCON_LIST.length; i++ ){
        refreshStatusCommand(AIRCON_LIST[i].deviceId);
    }

}, 2000);

/**
 * 상태조회 Command를 Queue에 담는다.
 * @param idx
 */
function refreshStatusCommand(idx){
    let strHexData = '8000A3';
    strHexData += (idx+'').padStart(2,'0');
    strHexData += '000000';
    strHexData += util.getXorSumHexValue(strHexData);
    sendQueue.push({type: 'refresh', hex : strHexData});
}

// 전송관리
let sendQueue = [];
let waitForReceiving = 0;
setInterval(function(){
    if( sendQueue.length > 0 ) {
        if( waitForReceiving === 0 || (new Date().getTime() - waitForReceiving) > constant.timeout ) {
            let data = sendQueue.shift();
            if( !initCompleted && data.type === 'initCompleted' ){
                log(AIRCON_LIST.length + "개 에어컨 인식 완료");
                initCompleted = true;
                doSubscribe();
            }else {
                netClient.write(util.strToHexByte(data.hex));
                waitForReceiving = new Date().getTime();
            }

        }
    }
}, constant.queueInterval);


// Data 처리
function receive(strFrame){
    let testHex = strFrame.substring(0,strFrame.length-2);
    let checksumHex = strFrame.substring(strFrame.length-2,strFrame.length);
    if(util.getXorSumHexValue(testHex) !== checksumHex){
        return false;
    }

    // AIRCON_LIST에 상태조회 된 에어컨 OBJECT를 추가한다.
    let aircon = new Aircon(strFrame);
    let deviceId = aircon.deviceId
    if( initCompleted === false ) {
        AIRCON_LIST.push(aircon);

        // MQTT Sensor Config 등록.
        util.sensorConfigPublish(client, deviceId, "currentTemp", "현재 온도", "temperature", "°C");
        util.sensorConfigPublish(client, deviceId, "pipe1Temp", "파이프1 온도", "temperature", "°C");
        util.sensorConfigPublish(client, deviceId, "pipe2Temp", "파이프2 온도", "temperature", "°C");
        util.sensorConfigPublish(client, deviceId, "targetTemp", "설정 온도", "temperature", "°C");
        util.sensorConfigPublish(client, deviceId, "outsideTemp", "실외기 온도", "temperature", "°C");
        util.sensorConfigPublish(client, deviceId, "mode", "모드", null, null);

        // MQTT climate Config 등록.
        util.climateConfigPublish(client, deviceId);


    }else{
        let idx = AIRCON_LIST.findIndex(function(obj){
            return obj.deviceId === aircon.deviceId;
        });
        AIRCON_LIST[idx] = aircon;

        // 현재 값 전송
        client.publish(constant.SENSOR_TOPIC + '/ac'+deviceId+'/state'
            , JSON.stringify(aircon.json)
            , {retain: true}
        );
    }
}


/////////////////////////////////////////////////////////////////
// MQTT 처리
/////////////////////////////////////////////////////////////////

/**
 * 기기가 다 인식되면 기기 MQTT 주소를 청취한다.
 */
function doSubscribe(){
    AIRCON_LIST.forEach(aircon => {
        let topic = constant.CLIMATE_TOPIC + '/ac'+aircon.deviceId + '/+';
        client.subscribe(topic, (err) => {if (err) log('MQTT Subscribe fail! -') });
    })
}

client.on('message', (topic, message) => {
    let topics = topic.split('/');
    let topicDeviceIdx = (topics[3].replace('ac',''));
    let command = topics[4];
    let strMessage = message.toString();

    let deviceId = util.getIdxFromDeviceId(AIRCON_LIST, topicDeviceIdx);
    AIRCON_LIST[deviceId][command] = strMessage;

    // send TCP message
    sendQueue.push({type:'command', hex: AIRCON_LIST[deviceId].packet});

});

let AIRCON_LIST = [];
