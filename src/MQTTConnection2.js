import MQTT from 'sp-react-native-mqtt';
import _ from 'underscore';

module.exports = {
  // cached singleton instance
  QOS: 2, // Only 0 and 1 supported by Rabbit
  props: null,
  randIdCreator() {
    const S4 = () =>
      // eslint-disable-next-line no-bitwise
      (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return `random${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}`;
  },
  create(userID, connectionProps = {}) {
    if (userID && connectionProps) {
      // http://www.hivemq.com/demos/websocket-client/
      this.onConnectionOpened = this.onConnectionOpened.bind(this);
      this.onConnectionClosed = this.onConnectionClosed.bind(this);
      this.onError = this.onError.bind(this);
      this.onMessageArrived = this.onMessageArrived.bind(this);
      this.disconnect = this.disconnect.bind(this);

      this.conProps = _.extend(
        {
          auth: true,
        },
        connectionProps,
      );

      /* create mqtt client */
      MQTT.createClient(this.conProps)
        .then(client => {
          this.client = client;
          client.on('closed', this.onConnectionClosed);
          client.on('error', this.onError);
          client.on('message', this.onMessageArrived);
          client.on('connect', this.onConnectionOpened);
          client.connect();
        })
        .catch(err => {
          console.error(`MQTT.createtClient error: ${err}`);
        });
    }
  },

  disconnect() {
    if (this.client) {
      console.log('Now killing open realtime connection.');
      this.client.disconnect();
    }
  },

  onError(error) {
    console.error(`MQTT onError: ${error}`);
  },

  onConnectionOpened() {
    // subscribe to the client channel
    this.client.subscribe(this.conProps.channelToUse, this.QOS);

    console.log('MQTT onConnectionOpened');
  },

  onConnectionClosed(err) {
    console.log(`MQTT onConnectionClosed ${err}`);
  },

  onMessageArrived(message) {
    if (message) {
      console.log(`MQTT New message: ${JSON.stringify(message)}`);
    }
  },
};
