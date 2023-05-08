// V.1.0.0
import RNSerialport from 'react-native-serial-port-api';
var Buffer = require('buffer/').Buffer;
const vmcCmd = require('./vmc');
var retryDelay = 200,
  retryTimes = 5;
var lastCommand = '';
// Create a port
const main_event = {};
// Open errors will be emitted as an error event
var SerialPort;
var clear;
var buffer;
var lastAct;
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
    clear = setTimeout(decodeMessage, 50);
  });
}

function decodeMessage() {
  // console.log(buffer.toString("hex"));
  if (buffer.length == 0) return; //   No data;
  let data = {message: buffer, text: buffer.toString('hex')};
  buffer = Buffer.alloc(0); // Clear Buffer
  let decode = vmcCmd.decodeText(data.text);
  // sendCommand(vmcCmd.act);
  console.log('START DECODE:::', decode);
  if (!decode) {
    sendCommand(vmcCmd.act);
  } else if (decode.command == '41') {
    // 41 = POLL form VMC
    let qcmd = vmcCmd.getQueue(); // get queue Command
    //console.log('Queue ===', qcmd);
    if (qcmd) {
      let cmd = vmcCmd.genCommand(qcmd);
      sendCommand(cmd); // UPC send command in queue
      vmcCmd.addPackage();
      vmcCmd.clearQueue();
      vmcCmd.onProcess();
      console.log('Sending command ...', cmd);
    } else {
      sendCommand(vmcCmd.act); // UPC have to act back too.
      //console.log('Sending ACT ...');
    }
  } else if (decode.command == '42') {
    // VMC Act
    vmcCmd.addVmcAct();
    vmcCmd.clearProcess();
    console.log('VMC ACT: ', data.message);
  } else {
    if (decode.command == '31') {
      sendCommand(data.message);
      //console.log('Sync time data ..', data.message);
    } else {
      /// Detect Function
      sendCommand(vmcCmd.act); // UPC have to act back too.
      // if (decode.command == '64') {
      //   if (main_event.coin_insert) {
      //     main_event.coin_insert('coinamount');
      //   }
      // }
      if (decode.command == '21') {
        console.log('DECODE', decode);
        if (decode.message !== lastAct) {
          lastAct = decode.message;
        } else {
          console.log('DECODE2!!!', decode);
          return;
        }
        //console.log(decode);
        let evname =
          decode.mode !== '8'
            ? 'money_insert'
            : //: // : decode.mode == '1'
              // ? 'bill_insert'
              //decode.mode == '8'
              'reset_money';
        //: 'othermoney_insert'; // on other data from vmc
        if (main_event[evname]) {
          main_event[evname]({
            tltle: decode.title,
            mode: decode.modeText,
            amount: decode.amount
              .toString()
              .substring(0, decode.amount.length - 2),
          });
        }
      }
      //cb(decode);
    }
  }
}
// Switches the port into "flowing mode"
// port.on('data', function (data) {
//   console.log('Data: < === ', data)
// })

// Pipe the data into another stream (like a parser or standard out)
//const lineStream = port.pipe(new Readline())

function sendCommand(cmd) {
  // ???
  // console.log('REAL HEX===>', cmd);
  // console.log('HEX===>', cmd.toString('hex'));
  //console.log('BUFFER ===>', Buffer.from(cmd.toString('hex'), 'hex'));
  SerialPort.send(cmd.toString('hex')); // or cmd.toString('hex') ?
  // port.write(cmd, function(err) {
  //     lastCommand = vmcCmd.toString("hex");
  //     if (err) {
  //       return console.log('Error on write: ', err.message)
  //     }
  //     // console.log("Sending command .... " , cmd);
  // })
}

function checkVmcAct(cb) {
  let a = vmcCmd.getVmcAct();
  console.log('ACT?? : ', a);
  retryTimes--;
  if (a > 0) {
    retryTimes = 5;
    let d = {result: true, message: 'Success'};
    vmcCmd.clearVmcAct();
    cb(d);
    return d;
  } else {
    if (retryTimes > 0) {
      setTimeout(() => {
        checkVmcAct(cb);
      }, retryDelay);
    } else {
      retryTimes = 5;
      let d = {result: false, message: 'No VMC response'};
      vmcCmd.clearVmcAct();
      cb(d);
      return d;
    }
  }
}

var maincontroll = {self: this};

/// Event from VMC to Android
maincontroll.on = function (eventname, cb) {
  if (eventname == 'vmc-data') main_event.vmc_data = cb;
  if (eventname == 'money-insert') main_event.money_insert = cb;
  if (eventname == 'bill-insert') main_event.bill_insert = cb;
  if (eventname == 'othermoney-insert') main_event.othermoney_insert = cb;
  if (eventname == 'reset-money') main_event.reset_money = cb;
  if (eventname == 'current-amount') main_event.current_amount = cb;
  if (eventname == 'temperature-update') main_event.alert_temperature = cb;
  if (eventname == 'serial-error') main_event.serial_err = cb;
  if (eventname == 'vmc-error') main_event.vmc_err = cb;
  if (eventname == 'dispense') main_event.dispense = cb; // dispense complete or error
};

/// Send command from android to VMC ///
function sendAndWait(data, cb) {
  console.log(vmcCmd.getProcess());
  if (vmcCmd.getProcess()) {
    cb(false, 'vmc on processing', '1031');
    return false;
  }
  vmcCmd.addQueue(data);
  vmcCmd.onProcess();
  checkVmcAct(res => {
    vmcCmd.addPackage();
    vmcCmd.clearProcess();
    vmcCmd.clearQueue();
    cb(res);
  });
}

maincontroll.selectionNumber = function (SlotId, cb) {
  if (!(Number(SlotId) > 0)) {
    cb(false, 'Selection Number Invalid', '1003');
    return false;
  }
  let q = {
    cmd: '03',
    text: `0101${vmcCmd.base16(45, 4)}`,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};
maincontroll.dispense = function (data, cb) {
  // data must have : ref1(Elevator) ref2(Sensor) slot(Selection Number);
  if (!data.slot) {
    cb(false, 'Selection Number Invalid', '1003');
    return false;
  }
  let q = {
    cmd: '06',
    text: `${data.lift == true ? '01' : '00'}${
      data.sensor == true ? '01' : '00'
    }${vmcCmd.base16(data.slot, 4)}`,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.coinexchange = function (data, cb) {
  if (!data.amount) {
    cb(false, 'Change Amount Invalid', '1004');
    return false;
  }
  let q = {
    cmd: '70',
    text: `390101${vmcCmd.base16(data.amount * 2, 4)}`,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.setcoinstatus = function (data, cb) {
  if (!data.amount) {
    cb(false, 'Change Amount Invalid', '1004');
    return false;
  }
  let q = {
    cmd: '28',
    text: `0100000`,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.setbillstatus = function (data, cb) {
  if (!data.amount) {
    cb(false, 'Change Amount Invalid', '1004');
    return false;
  }
  let q = {
    cmd: '28',
    text: `00ffff`,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.givechange = function (data, cb) {
  let q = {
    cmd: '25',
    text: ``,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.openReceived = function (data, cb) {
  let q = {
    cmd: '',
    text: ``,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.stopReceived = function (data, cb) {
  let q = {
    cmd: '',
    text: ``,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.resetMoney = function (data, cb) {
  let q = {
    cmd: '',
    text: ``,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.clearUserMoney = function (data, cb) {
  let q = {
    cmd: '',
    text: ``,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.getCashDeviceInfo = function (data, cb) {
  let q = {
    cmd: '',
    text: ``,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};
maincontroll.getCashStatus = function (data, cb) {
  let q = {
    cmd: '',
    text: ``,
    ts: Math.floor(Number(new Date())),
  };
  sendAndWait(q, cb);
};

maincontroll.open = function () {
  console.log('open');
  OpenPort();
};

// setTimeout(()=>{
//     maincontroll.dispense({slot : 45 , lift : true , sensor : true},(res,msg,code)=>{
//         console.log(res)
//         console.log(msg)
//         console.log(code)
//     })
// },5000)

module.exports = maincontroll;
