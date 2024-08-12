#!/usr/bin/with-contenv bashio
set +u

CONFIG_PATH=/data/options.json

bashio::log.info "$(cat /data/options.json)"



npm update && npm i

bashio::log.info "Starting PI485 service2"
node index.js