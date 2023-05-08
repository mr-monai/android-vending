import * as React from 'react';
import MQTT from 'sp-react-native-mqtt';
import {useSetRecoilState, useRecoilState} from 'recoil';
import * as GLOBAL from './globalState';
/* create mqtt client */
//CMD to publish
var CMD_GET_INVENTORY = 'get_inventory';
var CMD_GET_ADS = 'get_ads';
var CMD_GET_TOPUP = 'get_topup';
var CMD_GET_DEALY = 'get_delay';
var CMD_GET_PTPOINT = 'get_ptpoint';
var CMD_GET_RECHECK = 'get_recheck';

const connect = (
  user,
  clientId,
  subscribe,
  publish,
  topicCheckIn,
  topicApiCmd,
  topicCron,
  mqttClient,
  QRPaymentResult,
  category,
  inventory,
  inventoryAll,
  cb,
) => {
  var options = {
    uri: 'mqtt://mqtt.advancevending.net:2883',
    user: user.replace(/"/g, ''),
    clientId: clientId,
    auth: true,
  };
  console.log('options', options);
  MQTT.createClient(options)
    .then(function (client) {
      console.log('client===>', client, typeof client);
      client.on('closed', function () {
        console.log('mqtt.event.closed');
      });

      client.on('error', function (msg) {
        console.log('mqtt.event.error', msg);
        client.disconnect();
        setTimeout(() => {
          client.connect();
        }, 2000);
      });

      client.on('message', function (msg) {
        console.log('mqtt.event.message', msg);
        try {
          var res = JSON.parse(msg.data);
          switch (res.cmd) {
            case 'qr_payment_result':
              console.log('SAVE QR RESULT');
              QRPaymentResult(res.result);
              break;
            case 'setup_inventory':
              inventory(res.inventory);
              inventoryAll(res.inventory);
              var arrayCategory = [
                {
                  _id: 'all',
                  categoryName: 'ALL',
                },
              ];
              arrayCategory = arrayCategory.concat(res.category);
              category(arrayCategory);
              console.log('SYNC!!!!');
              break;
            default:
              break;
          }
          cb(res);
        } catch (error) {
          console.log(error);
        }
      });

      client.on('connect', function () {
        console.log('connected');
        console.log('subscribe:', subscribe);
        mqttClient(client);
        subscribe.forEach(topic => client.subscribe(topic, 2));
        var topicCheckInStatus = false;
        var topicApiCmdStatus = false;
        var topicCronStatus = false;
        console.log('PUBLIC:', publish);
        publish.map(topic => {
          if (topic.includes('checkin')) {
            console.log('CHECK-IN!!!');
            topicCheckInStatus = true;
            topicCheckIn(topic);
          } else if (topic.includes('server/api/command')) {
            topicApiCmd(topic);
            topicApiCmdStatus = true;
          } else if (topic.includes('cron/success')) {
            topicCron(topic);
          }
        });
        if (topicCheckInStatus) {
          console.log('CHECK-IN');
          var payload = {
            coinStack: {C1: 234, C2: 0, C5: 100, C10: 52},
            boardStatus: true,
            mdbStatus: true,
          };
          client.publish('/checkin', JSON.stringify(payload), 2, false);
        }
        if (topicApiCmdStatus) {
          var payload = {
            cmd: CMD_GET_INVENTORY,
          };
          client.publish(
            '/server/api/command',
            JSON.stringify(payload),
            2,
            false,
          );
        }
        if (topicCronStatus) {
        }
      });

      client.connect();
    })
    .catch(function (err) {
      console.log(err);
    });
};

const publicCheckin = mqttClient => {
  try {
    var payload = {
      coinStack: {C1: 234, C2: 0, C5: 100, C10: 52},
      boardStatus: true,
      mdbStatus: true,
    };
    console.log(payload);
    mqttClient.publish('/checkin', JSON.stringify(payload), 2, false);
    console.log('Message published Check In successfully!');
    return true;
  } catch (error) {
    return false;
  }
};

const publicQRPaymentResult = mqttClient => {
  try {
    var payload = {
      coinStack: {C1: 234, C2: 0, C5: 100, C10: 52},
      boardStatus: true,
      mdbStatus: true,
    };
    console.log(payload);
    mqttClient.publish('/checkin', JSON.stringify(payload), 2, false);
    console.log('Message published Check In successfully!');
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  connect,
  publicCheckin,
  publicQRPaymentResult,
};
