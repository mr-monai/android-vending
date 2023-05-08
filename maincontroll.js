// V.1.0.0
import RNSerialport from 'react-native-serial-port-api';
var Buffer = require('buffer/').Buffer;
const vmcCmd = require('./vmc');

var retryDelay = 10,
  retryTimes = 100,
  startCheck = 0;
const mainevent = {};
var waitfnc = {};
var waitactfnc = {};
var waitingevent = [];
var clearwaitfnc = [];
function calwaitingevent(e, cb) {
  waitingevent.push(e);
  waitfnc[e] = cb;
  return;
}

function waitingeventpop(e) {
  let i = waitingevent.indexOf(e);
  if (i > -1) waitingevent.splice(i, 1);
  return;
}

let cn = 5;
function checkpoll() {
  setTimeout(() => {
    if (buffer.toString() == '') {
      if (cn <= 0) {
        if (mainevent.vmcerr)
          mainevent.vmcerr({
            result: false,
            message: 'Not found poll from VMC',
            code: '90001',
          });
        console.error(
          '*************** !!! NOT FOUND VMC POLL !!! ***************',
        );
        cn = 5;
        checkpoll();
      } else {
        cn--;
        checkpoll();
      }
    } else {
      cn = 5;
      checkpoll();
    }
    if (clearwaitfnc[0]) {
      delete waitactfnc[clearwaitfnc[0]];
      clearwaitfnc.splice(0, 1);
    }
  }, 10000);
  // console.log('WAIT TO CLEAR(FNC) : ',clearwaitfnc);
}

checkpoll();

// Create a port
// Open errors will be emitted as an error event
var SerialPort;
var clear;
var buffer;
async function OpenPort() {
  SerialPort = await RNSerialport.open('/dev/ttyS1', {
    baudRate: 57600,
  });
  console.log('START PORT');
  buffer = Buffer.alloc(0);
  // Read data that is available but keep the stream in "paused mode"
  SerialPort.onReceived(msg => {
    buffer = Buffer.concat([buffer, msg]);
    clearTimeout(clear);
    clear = setTimeout(decodeMessage, 10);
    // decodeMessage(msg)
  });
}

function decodeMessage() {
  // console.log(buffer.toString("hex"));
  if (buffer.length == 0) return; //   No data;
  let data = {message: buffer, text: buffer.toString('hex')};
  buffer = Buffer.alloc(0); // Clear Buffer
  let decode = vmcCmd.decodeText(data.text);
  // console.log(decode);
  if (!decode) {
    sendCommand(vmcCmd.act);
  } else if (decode.command == '41') {
    // 41 = POLL form VMC
    let qcmd = vmcCmd.getQueue(); // get queue Command
    // console.log('Queue ===', qcmd);
    if (qcmd) {
      let cmd = vmcCmd.genCommand(qcmd);
      sendCommand(cmd); // UPC send command in queue
      checkVmcAct(waitactfnc[qcmd.e + qcmd.ts], qcmd.e + qcmd.ts);
      vmcCmd.shiftQueue();
      console.log('Sending command : ', cmd);
    } else {
      sendCommand(vmcCmd.act); // UPC have to act back too.
    }
  } else if (decode.command == '42') {
    // VMC Act
    vmcCmd.addVmcAct();
    console.log('act from vmc : ', data.message);
  } else {
    if (decode.command == '31') {
      sendCommand(data.message);
    } else {
      console.log(decode);
      /// Detect Function
      sendCommand(vmcCmd.act); // UPC have to act back too.
      if (decode.command == '02') {
        let d = {
          result: ['01', '02'].indexOf(decode.status) > -1 ? true : false,
          title: decode.title,
          message: decode.statusText,
          selectionNumber: decode.selectionNumber,
          status: decode.status,
          code: `5${decode.command}${decode.status}`,
        };
        if (mainevent.selectionnumber) mainevent.selectionnumber(d);
        if (waitingevent.indexOf('selectionnumber') > -1)
          waitfnc.selectionnumber(d);
      } else if (decode.command == '04') {
        // console.log('decode 04 ==>',decode);
        let d = {
          result:
            ['01', '02', '10', '11', '40', '41', '42'].indexOf(decode.status) >
            -1
              ? true
              : false,
          title: decode.title,
          selectionNumber: decode.selectionNumber,
          status: decode.status,
          message: decode.statusText,
          code: `5${decode.command}${decode.status}`,
        };
        if (mainevent.dispense) mainevent.dispense(d);
        if (waitingevent.indexOf('dispense') > -1) waitfnc.dispense(d);
        if (['01', '02', '10', '11', '40', '41'].indexOf(decode.status) != -1)
          waitingeventpop('dispense');
      } else if (decode.command == '21') {
        // console.log('decode 21 ==>',decode);
        let evname = decode.mode == '8' ? 'resetmoney' : 'receivemoney';
        let d = {
          result: true,
          title: decode.title,
          message: 'ok',
          mode: decode.modeText,
          amount:
            decode.amount.toString().length > 2
              ? decode.amount
                  .toString()
                  .substring(0, decode.amount.toString().length - 2)
              : decode.amount,
          code: `1${decode.command}00`,
        };
        if (mainevent[evname]) mainevent[evname](d);
        if (waitingevent.indexOf(evname) > -1) waitfnc[evname](d);
      } else if (decode.command == '23') {
        // console.log('decode 23 ==>',decode);
        let d = {
          result: true,
          title: decode.title,
          message: 'ok',
          amount:
            decode.amount.toString().length > 2
              ? decode.amount
                  .toString()
                  .substring(0, decode.amount.toString().length - 2)
              : decode.amount,
          code: `1${decode.command}00`,
        };
        if (mainevent.currentamount) mainevent.currentamount(d);
        if (waitingevent.indexOf('currentamount') > -1)
          waitfnc.currentamount(d);
      } else if (decode.command == '26') {
        // console.log('decode 26 ==>',decode);
        let d = {
          result: true,
          title: decode.title,
          message: 'ok',
          coinChange:
            decode.coinChange.toString().length > 2
              ? decode.coinChange
                  .toString()
                  .substring(0, decode.coinChange.toString().length - 2)
              : decode.coinChange,
          billChange:
            decode.billChange.toString().length > 2
              ? decode.billChange
                  .toString()
                  .substring(0, decode.billChange.toString().length - 2)
              : decode.billChange,
          code: `1${decode.command}00`,
        };
        if (mainevent.givechange) mainevent.givechange(d);
        if (waitingevent.indexOf('givechange') > -1) waitfnc.givechange(d);
      } else if (decode.command == '29') {
        // console.log('decode 26 ==>',decode);
        let d = {
          result: true,
          title: decode.title,
          message: decode.statusText,
          status: decode.status,
          code: `6${decode.command}${decode.status}`,
        };
        if (mainevent.setacceptreceivemoney) mainevent.setacceptreceivemoney(d);
        if (waitingevent.indexOf('setacceptreceivemoney') > -1)
          waitfnc.setacceptreceivemoney(d);
      } else if (decode.command == '33') {
        // console.log('decode 33 ==>',decode);
        let d = {
          result: true,
          title: 'User push cancel',
          message: 'Push cancel',
          status: '00',
          code: `6${decode.command}00`,
        };
        if (mainevent.usercancel) mainevent.usercancel(d);
      } else if (decode.command == '52') {
        // console.log('decode 52 ==>',decode);
        let d = {
          result: true,
          title: decode.title,
          message: 'ok',
          status: '00',
          billAccept: decode.billAccept,
          coinAccept: decode.coinAccept,
          temperature: decode.temperatureText,
          doorStatus: decode.doorStatusText,
          billChange: decode.billChangeText,
          coinChange: decode.coinChangeText,
          machineTemperature: decode.machineTemperatureText,
          code: `1${decode.command}00`,
        };
        if (mainevent.machinestatus) mainevent.machinestatus(d);
      } else if (decode.command == '71') {
        if (decode.commandType == '40') {
          let d = {
            result: true,
            message: decode.title,
            total: decode.coinAmount
              .toString()
              .substring(0, decode.coinAmount.length - 2),
            coin1: decode.coin1,
            coin5: decode.coin5,
            coin10: decode.coin10,
            code: `2${decode.command}${decode.commandType}${decode.status}`,
          };
          if (mainevent.querycoinnumber) mainevent.querycoinnumber(d);
          if (waitingevent.indexOf('querycoinnumber') > -1)
            waitfnc.querycoinnumber(d);
        }
      } else {
        // console.log('decode other ==>',decode);
        if (mainevent.vmcdata) mainevent.vmcdata(decode);
      }
    }
  }
}

function sendCommand(cmd) {
  SerialPort.send(cmd.toString('hex')); // or cmd.toString('hex') ?
}

function checkVmcAct(cb, e) {
  setTimeout(() => {
    console.log('vmc act ? : ', vmcCmd.getVmcAct() > 0 ? true : false);
    retryTimes--;
    if (vmcCmd.getVmcAct() > 0) {
      retryTimes = 5;
      vmcCmd.clearVmcAct();
      vmcCmd.addPackage();
      cb({result: true, message: 'VMC Received Command', code: '00'});
      clearwaitfnc.push(e);
      return;
    } else {
      if (retryTimes > 0) {
        checkVmcAct(cb, e);
      } else {
        retryTimes = 5;
        vmcCmd.clearVmcAct();
        vmcCmd.addPackage();
        cb({result: false, message: 'VMC Not Response', code: '104001'});
        clearwaitfnc.push(e);
        return;
      }
    }
  }, retryDelay);
}

var maincontroll = {self: this};

/// Event from VMC to Android
maincontroll.on = function (e, cb) {
  if (e == 'serialerror') mainevent.serialerror = cb;
  if (e == 'vmcerror') mainevent.vmcerr = cb;
  if (e == 'vmcdata') mainevent.vmcdata = cb;
  /// service monde functions
  if (e == 'machinestatus') mainevent.machinestatus = cb;

  /// dispense mode functions
  if (e == 'selectionnumber') mainevent.selectionnumber = cb;
  if (e == 'dispense') mainevent.dispense = cb; // dispense complete or error

  /// money control functions
  if (e == 'usercancel') mainevent.usercancel = cb;
  if (e == 'givechange') mainevent.givechange = cb;
  if (e == 'receivemoney') mainevent.receivemoney = cb;
  if (e == 'resetmoney') mainevent.resetmoney = cb;
  if (e == 'setacceptreceivemoney') mainevent.setacceptreceivemoney = cb;
  if (e == 'currentamount') mainevent.currentamount = cb;
  if (e == 'querycoinnumber') mainevent.querycoinnumber = cb;
};

/// Send command from android to VMC ///
function sendAndWait(d, cb) {
  vmcCmd.addQueue(d);
  waitactfnc[d.e + d.ts] = cb;
  return;
}

maincontroll.selectionnumber = function (SlotId, cb) {
  if (!(Number(SlotId) > 0)) {
    cb({result: false, message: 'Selection Number Invalid', code: '1003'});
  }
  sendAndWait(
    {
      e: 'selectionnumber',
      cmd: '01',
      text: `${vmcCmd.base16(SlotId, 4)}`,
      ts: Math.floor(Number(new Date())),
    },
    vmcact => {
      if (vmcact.result == false) {
        cb(vmcact);
      } else {
        calwaitingevent('selectionnumber', res => {
          waitingeventpop('selectionnumber');
          cb(res);
        });
      }
    },
  );
  return;
};
maincontroll.dispense = function (SlotId, cb) {
  if (!(Number(SlotId) > 0)) {
    cb({result: false, message: 'Selection Number Invalid', code: '1003'});
    return;
  }
  maincontroll.selectionnumber(SlotId, slot => {
    console.log('Dispense Selection Number ===>', slot);
    if (slot.result == false) {
      cb(slot);
      return;
    } else {
      sendAndWait(
        {
          e: 'dispense',
          cmd: '06',
          text: `0101${vmcCmd.base16(SlotId, 4)}`,
          ts: Math.floor(Number(new Date())),
        },
        vmcact => {
          if (vmcact.result == false) {
            cb(vmcact);
          } else {
            calwaitingevent('dispense', ds => {
              console.log('Dispensing ===>', slot);
              cb(ds);
            });
          }
        },
      );
    }
  });
  return;
};

maincontroll.givechange = function (amount, cb) {
  if (isNaN(amount)) {
    cb({result: false, message: 'Change Amount Invalid', code: '1004'});
    return;
  }
  sendAndWait(
    {
      e: 'givechange',
      cmd: '25',
      text: amount > 0 ? `${vmcCmd.base16(amount + '00', 8)}` : '',
      ts: Math.floor(Number(new Date())),
    },
    vmcact => {
      if (vmcact.result == false) {
        cb(vmcact);
      } else {
        calwaitingevent('givechange', res => {
          console.log('givechange ===>', res);
          waitingeventpop('givechange');
          cb(res);
        });
      }
    },
  );
  return;
};

maincontroll.setcoinaccept = function (accept, cb) {
  sendAndWait(
    {
      e: 'setcoinaccept',
      cmd: '28',
      text: `01${accept ? 'ffff' : '0000'}`,
      ts: Math.floor(Number(new Date())),
    },
    vmcact => {
      if (vmcact.result == false) {
        cb(vmcact);
      } else {
        calwaitingevent('setacceptreceivemoney', res => {
          console.log('setacceptreceivemoney coin ===>', res);
          waitingeventpop('setacceptreceivemoney');
          cb(res);
        });
      }
    },
  );
  return;
};

maincontroll.setbillaccept = function (accept, cb) {
  sendAndWait(
    {
      e: 'setbillaccept',
      cmd: '28',
      text: `00${accept ? 'ffff' : '0000'}`,
      ts: Math.floor(Number(new Date())),
    },
    vmcact => {
      if (vmcact.result == false) {
        cb(vmcact);
      } else {
        calwaitingevent('setacceptreceivemoney', res => {
          console.log('setacceptreceivemoney bill ===>', res);
          waitingeventpop('setacceptreceivemoney');
          cb(res);
        });
      }
    },
  );
  return;
};

maincontroll.resetmoney = function (cb) {
  sendAndWait(
    {
      e: 'resetmoney',
      cmd: '27',
      text: `08`,
      ts: Math.floor(Number(new Date())),
    },
    vmcact => {
      if (vmcact.result == false) {
        cb(vmcact);
      } else {
        calwaitingevent('resetmoney', res => {
          console.log('resetmoney ===>', res);
          waitingeventpop('resetmoney');
          cb(res);
        });
      }
    },
  );
  return;
};

maincontroll.querycoinnumber = function (cb) {
  sendAndWait(
    {
      e: 'querycoinnumber',
      cmd: '70',
      text: `4000`,
      ts: Math.floor(Number(new Date())),
    },
    vmcact => {
      if (vmcact.result == false) {
        cb(vmcact);
      } else {
        calwaitingevent('querycoinnumber', res => {
          console.log('querycoinnumber ===>', res);
          waitingeventpop('querycoinnumber');
          cb(res);
        });
      }
    },
  );
  return;
};

maincontroll.onready = function (cb) {
  resetCommuNumber(res => {
    cb(
      res
        ? {result: true, message: 'ok reaedy', code: '104000'}
        : {result: false, message: 'communication Error', code: '104001'},
    );
  });
};

maincontroll.open = function () {
  console.log('open');
  OpenPort();
};

function resetCommuNumber(cb) {
  maincontroll.resetmoney(res => {
    console.log('RECHECK ==>', res);
    startCheck++;
    if (res.code == '104001') {
      if (startCheck < 255) {
        setTimeout(() => {
          resetCommuNumber(cb);
        }, retryDelay);
      } else {
        cb(false);
      }
    } else {
      cb(res);
    }
  });
  return;
}

module.exports = maincontroll;
