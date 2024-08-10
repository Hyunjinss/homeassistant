#!/usr/bin/with-contenv bashio
set +u

export MQTT_IP = ${mqtt_ip}
export MQTT_PORT = ${mqtt_port}
export MQTT_ID = ${mqtt_idp}
export MQTT_PW = ${mqtt_pw}

export EW11_ADDR = ${ew11_addr}
export EW11_QUEUE_INTERVAL = ${ew11_queue_interval}

npm install
bashio::log.info "Starting PI485 service."
npm run start
