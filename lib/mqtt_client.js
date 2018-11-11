'use strict';
const Base = require('sdk-base');
const mqtt = require('mqtt')
class RegistryClient extends Base {
  constructor(options) {
    super({
      // 指定异步启动的方法
      initMethod: 'init',
    });
    this._options = options;
    this._registered = new Map();
    this._mqClient = null;
  }

  /**
   * 启动逻辑
   */
  async init() {
    this._mqClient  = mqtt.connect(this._options.host,this._options)
    this._mqClient.on('connect', () => {
      this.ready(true);
     })
    this._mqClient.on('message',  (topic, message) => {
        this.doPub('egg-xc-mqtt-msg',{
          topic:topic,
          message:message.toString()
        })
    })
    this._mqClient.on('error',error=>{
      console.error(error);
    })
  }

  /**
   * 获取配置
   * @param {String} dataId - the dataId
   * @return {Object} 配置
   */
  async getConfig(dataId) {
    return this._registered.get(dataId);
  }

  /**
   * 订阅
   * @param {Object} reg
   *   - {String} dataId - the dataId
   * @param {Function}  listener - the listener
   */
  subscribe(topic, listener) {
    this._mqClient.subscribe(topic);
    this.on(topic, listener);
    const data = this._registered.get(topic);
    if (data) {
      process.nextTick(() => listener(data));
    }
  }

  /**
   * 发布
   * @param {Object} reg
   *   - {String} dataId - the dataId
   *   - {String} publishData - the publish data
   */
  publish(reg) {
    const topic = reg.topic
    const message = reg.message
    this._mqClient.publish(topic,message)
  }
  doPub(topic,message){
    this.emit(topic, message);
  }
}

module.exports = RegistryClient;