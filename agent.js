'use strict';
const MqttClient = require('./lib/mqtt_client');

module.exports = (agent) => {
  // 对 RegistryClient 进行封装和实例化
  agent.mqttClient = agent.cluster(MqttClient,{
    responseTimeout: 300 * 1000,
  })
    // create 方法的参数就是 RegistryClient 构造函数的参数
    .create(agent.config.xcMqtt);

  agent.beforeStart(async () => {
    await agent.mqttClient.ready();
    agent.coreLogger.info('mqtt client is ready');
  });
  const listen = agent.config.cluster.listen;
  agent.mqttClient.subscribe('egg-xc-mqtt-msg',msg => {
      agent.curl(`http://${listen.hostname}:${listen.port}/mqtt`,{
        method:'post',
        contentType: 'json',
        data: msg,
      })
  });

};