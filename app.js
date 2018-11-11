'use strict';
const MqttClient = require('./lib/mqtt_client');

module.exports = app => {
  app.mqttClient = app.cluster(MqttClient,{
    responseTimeout: 300 * 1000,
  }).create(app.config.xcMqtt);
  app.beforeStart(async () => {
    await app.mqttClient.ready();
    app.coreLogger.info('mqttClient client is ready');
  });
};