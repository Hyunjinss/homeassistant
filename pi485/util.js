
////////////////////////////////////////////////////////////////////
// UTIL
////////////////////////////////////////////////////////////////////
const constant = require("./const");

function strToArray(strHex){
    var idx = 0;
    var arrHex = [];
    while( strHex.length > 0 ){	// 마지막 2 byte는 변환하지 않도록 한다.
        arrHex.push(eval("0x" + strHex.substr(idx, 2)));
        strHex = strHex.substr(2);
    }
    return arrHex;

}
// Binary로 전환(String parameter)
function strToHexByte(strHexData){
    return Buffer.from( strHexData, 'hex' );
}
// Binary로 전환(String Array parameter)
function arrStrToHexByte(arrHexData){
    return strToHexByte(arrHexData.join(''));
}
function getAddSumDecValue(strHex){
    let arrHex = strToArray(strHex);
    let addValue = 0;
    arrHex.forEach(function(a,b){
        addValue += a;
    });
    return (addValue % 0x100);
}
function getXorSumDecValue(strHex){
    let addSumDecValue = getAddSumDecValue(strHex);
    return addSumDecValue ^ 0x55;
}
function getXorSumHexValue(strHex){
    return (getXorSumDecValue(strHex).toString(16)).padStart(2,'0');
}

function sensorConfigPublish(client, deviceId, item, itemNm, deviceClass, unit){
    client.publish(constant.SENSOR_TOPIC + '/ac'+deviceId+'/'+item+'/config'
        , JSON.stringify({
            "name": itemNm,
            "availability": [{"topic": "zigbee2mqtt2/bridge/state","value_template": "{{ value_json.state }}"}],
            "device": {
                "identifiers": [
                    "ac"+deviceId+""
                ],
                "manufacturer": "LG",
                "model": "None",
                "name": "에어컨"+deviceId
            },
            "device_class": deviceClass,
            "enabled_by_default": true,
            "object_id": "ac"+deviceId+"_"+item,
            "state_class": "measurement",
            "state_topic": constant.SENSOR_TOPIC+"/ac"+deviceId+"/state",
            "unique_id": "ac"+deviceId+"_"+item,
            "unit_of_measurement": "°C",
            "value_template": "{{ value_json."+item+" }}"
        })
        , {retain: true}
    );
}

function climateConfigPublish(client, deviceId){
    let climateTopic = constant.CLIMATE_TOPIC + "/ac"+deviceId;
    let sensorTopic = constant.SENSOR_TOPIC + "/ac"+deviceId;

    client.publish(constant.CLIMATE_TOPIC + '/ac'+deviceId+'/config'
        , JSON.stringify({
            "name":                             deviceId+" HVAC",
            "unique_id":                        "hvac_ac"+deviceId,
            "object_id":                        "hvac_ac"+deviceId,
            "availability": 			[{"topic": "zigbee2mqtt2/bridge/state","value_template": "{{ value_json.state }}"}],

            "power_command_topic" :climateTopic+"/status",
            "power_topic":    sensorTopic+"/state",
            "power_template":    "{{ value_json.status }}",
            "payload_on" : "on",
            "payload_off" : "off",


            "temperature_command_topic" : climateTopic+"/targetTemp",
            "temperature_topic":    sensorTopic+"/state",
            "temperature_template":    "{{ value_json.targetTemp }}",

            "current_temperature_topic":    sensorTopic+"/state",
            "current_temperature_template":    "{{ value_json.currentTemp }}",

            "fan_mode_command_topic":    climateTopic+"/flow",
            "fan_mode_state_topic":             sensorTopic+"/state",
            "fan_mode_state_template":             "{{ value_json.flow }}",
            "fan_modes":                        ["자동",
                "약",
                "중",
                "강" ],

            "mode_command_topic":         climateTopic + "/mode",
            "mode_state_topic":                sensorTopic + "/state",
            "mode_state_template":            "{{ value_json.mode }}",
            "modes":                            ["off", "auto", "cool", "dry", "fan_only"],

            "swing_mode_command_topic":       climateTopic + "/swing",
            "swing_mode_state_topic":         sensorTopic + "/state",
            "swing_mode_state_template":      "{{ value_json.swing}}",
            "swing_modes":                    ["on","off"],

            "precision":                        1,
            "retain":                           false,
            "temp_step":                        1,
            "min_temp": 18,
            "max_temp": 30,
            "device": {"identifiers": ["ac"+deviceId],"manufacturer": "LG","model": "None","name": "에어컨"}
        })
        , {retain: true}
    );
}


function getIdxFromDeviceId(AIRCON_LIST, deviceId){
    return AIRCON_LIST.findIndex(function(obj){
        return obj.deviceId === deviceId;
    });
}

module.exports = {
    strToArray, arrStrToHexByte,getXorSumHexValue,getAddSumDecValue,strToHexByte,getXorSumDecValue, sensorConfigPublish, climateConfigPublish, getIdxFromDeviceId
}