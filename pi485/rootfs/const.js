
const CONFIG = require('/data/options.json');

// TCP(EW11) 포트
const port = CONFIG.ew11.port;
const ip = CONFIG.ew11.ip;
const timeout = 1000;
const queueInterval = 300;

const mqttBroker = CONFIG.mqtt.broker;
const mqttDelay = 300;
const mqttUser = CONFIG.mqtt.id;
const mqttPass = CONFIG.mqtt.pw;
const clientID = CONFIG.mqtt.clientID;
const ROOT_TOPIC = CONFIG.mqtt.discovery_topic;
const CLIMATE_TOPIC = ROOT_TOPIC + '/climate/aircon'
const SENSOR_TOPIC = ROOT_TOPIC + '/sensor'




const MODE = {
    STATUS : {
        '0': '스캔',
        '1': '상태확인',
        '2': 'off',
        '3': 'on',
        '4': 'off',
        '5': 'on',
        '스캔':'0',
        '상태확인':'1',
        'off':'2',
        'on':'3',
        '잠금꺼짐':'4',
        '잠금켜짐':'5'
    },

    // [“auto”, “off”, “cool”, “heat”, “dry”, “fan_only”]
    MODE: {
        '000': 'cool',
        '001': 'dry',
        '010': 'fan_only',
        '011': 'auto',
        '100': 'heat',
        'cool' : '000',
        'dry' : '001',
        'fan_only' : '010',
        'auto' : '011',
        'heat' : '100'
    },
    SWING: {
        '0': 'off',
        '1': 'on',
        'off':'0',
        'on': '1'
    },
    FLOW: {
        '0001': '약',
        '0010': '중',
        '0011': '강',
        '0100': '자동',
        '0101': '미약',
        '0110': '파워',
        '약' : '0001',
        '중' : '0010',
        '강' : '0011',
        '자동' : '0100',
        '미약' : '0101',
        '파워' : '0110'
    },
    getStatus: function (val) {
        return this.STATUS[val];
    },
    getMode: function (val) {
        let bin = val.toString(2).padStart(8, '0');
        bin = bin.substring(5); // 마지막 3자리
        return this.MODE[bin];
    },
    // binary 가져오는 함수
    getModeBin: function (val) {
        return this.MODE[val];
    },
    getSwing: function (val) {
        let bin = val.toString(2).padStart(8, '0');
        bin = bin.substring(4, 5);
        return this.SWING[bin];
    },
    // binary 가져오는 함수
    getSwingBin: function (val) {
        return this.SWING[val];
    },
    getFlow: function (val) {
        let bin = val.toString(2).padStart(8, '0');
        bin = bin.substring(0, 4);
        return this.FLOW[bin];
    },
    // binary 가져오는 함수
    getFlowBin: function (val) {
        return this.FLOW[val];
    }
}

module.exports = {
    port, ip, timeout, queueInterval, mqttBroker, mqttDelay, mqttUser, mqttPass, clientID, ROOT_TOPIC, MODE, CLIMATE_TOPIC, SENSOR_TOPIC
};