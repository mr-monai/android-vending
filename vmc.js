// V.1.0.0

const stx = 'fafb'; // Start of packet
var queue = []; // Command queue
var Buffer = require('buffer/').Buffer;

var runningPackage = 0;
var vmcact = 0;

function vmcCmd() {
  self = this;
}
/// Internal Function
function CRC(d) {
  let b = Buffer.from(d, 'hex');
  let crc = 0;
  for (let x = 0; x < b.length; x++) {
    crc ^= b[x];
  }
  return crc;
}
///////////////

vmcCmd.act = Buffer.from('fafb420043', 'hex'); // Act Package

vmcCmd.addVmcAct = function () {
  return (vmcact = Math.floor(new Date()));
};

vmcCmd.clearVmcAct = function () {
  return (vmcact = 0);
};

vmcCmd.getVmcAct = function () {
  return vmcact;
};

vmcCmd.getQueue = function () {
  return queue[0] || false;
};

vmcCmd.addQueue = function (d) {
  return queue.push(d);
};

vmcCmd.shiftQueue = function () {
  if (queue.length > 0) queue.splice(0, 1);
  return queue;
};

vmcCmd.base10 = function (n) {
  return parseInt(n, 16).toString();
};

vmcCmd.base16 = function (n, s) {
  return Number(n).toString(16).padStart(s, '0');
};

vmcCmd.getPackage = function () {
  return runningPackage && runningPackage + 1 > 255 ? 1 : runningPackage + 1;
};

vmcCmd.clearPackage = function () {
  return (runningPackage = 0);
};

vmcCmd.addPackage = function () {
  return runningPackage++;
};
vmcCmd.sendCommand = function (data, cb) {
  // Send command 2 Queue and wait ack
};

vmcCmd.genCommand = function () {
  let packages = this.getPackage() + 30;
  if (!packages || packages > 255) return '1001';
  let q = this.getQueue();
  if (!q) return '1002';
  let cl = this.base16(
    Buffer.from(this.base16(packages, 2) + q.text, 'hex').length,
    2,
  );
  let content = stx + q.cmd + cl + this.base16(packages, 2) + q.text;
  return Buffer.concat([
    Buffer.from(content, 'hex'),
    Buffer.from(this.base16(CRC(content) & 0xff, 2), 'hex'),
  ]);
};

vmcCmd.decodeText = function (message) {
  let xstx = message.indexOf(stx);
  let s = xstx == 0 ? stx.length : xstx == -1 ? 0 : xstx > 2 ? 0 : 0;
  let ic =
    xstx == 0 && message.substring(s).indexOf(stx) !== -1
      ? message.substring(s).indexOf(stx) - 2
      : message.length - 2;
  let d = {
    message: message,
    command: message.substring(s, (s += 2)),
    length: message.substring(s, (s += 2)),
    packNo: this.base10(message.substring(s, (s += 2))).toString(),
    text: message.substring(s, ic),
    crc: message.substring(ic, (ic += 2)),
    other: message.substring(ic),
  };
  d = defineStatus(d);
  return d;
};

vmcCmd.prototype.selectionNumber = function (n) {
  this.selectionNumber = n;
};

function defineStatus(data) {
  let s = 0;
  let txt = data.text;
  if (data.command == '02') {
    data.title = 'Selection Number';
    data.status = txt.substring(s, (s += 2));
    data.statusText = '';
    switch (data.status) {
      case '01':
        data.statusText = 'Normal';
        break;
      case '02':
        data.statusText = 'Out of stock';
        break;
      case '03':
        data.statusText = 'selection doesn’t exist';
        break;
      case '04':
        data.statusText = 'selection pause';
        break;
      case '05':
        data.statusText = 'There is product inside elevator';
        break;
      case '06':
        data.statusText = 'Delivery door unlocked';
        break;
      case '07':
        data.statusText = 'Elevator error';
        break;
      case '08':
        data.statusText = 'Elevator self-checking faulty';
        break;
      case '09':
        data.statusText = 'Microwave oven delivery door closing error';
        break;
      case '10':
        data.statusText = 'Microwave oven inlet door opening error';
        break;
      case '11':
        data.statusText = 'Microwave oven inlet door closing error';
        break;
      case '12':
        data.statusText = 'Didn’t detect box lunch';
        break;
      case '13':
        data.statusText = 'Box lunch is heating';
        break;
      case '14':
        data.statusText = 'Microwave oven delivery door opening error';
        break;
      case '15':
        data.statusText = ' Please take out the lunch box in the microwave';
        break;
      case '16':
        data.statusText = 'Staypole return error';
        break;
      case '17':
        data.statusText = 'Main motor fault';
        break;
      case '18':
        data.statusText = 'Translation motor fault';
        break;
      case '19':
        data.statusText = 'Staypole push error';
        break;
      case '21':
        data.statusText = 'Elevator entering microwave oven error';
        break;
      case '22':
        data.statusText = 'Pushrod pushing error in microwave oven';
        break;
      case '23':
        data.statusText = 'Pushrod returning error in microwave oven';
        break;
      default:
        'Unknown Status';
    }
    data.selectionNumber = vmcCmd.base10(txt.substring(s));
  } else if (data.command == '04') {
    data.title = 'Dispensing Status';
    data.status = txt.substring(s, (s += 2));
    data.selectionNumber = vmcCmd.base10(txt.substring(s, (s += 4)));
    data.microwaveNumber = txt.substring(s);
    let status = '';
    switch (data.status) {
      case '01':
        status = 'Dispensing';
        break;
      case '02':
        status = 'Dispensing successfully';
        break;
      case '03':
        status = 'Selection jammed';
        break;
      case '04':
        status = 'Motor doesn’t stop normally';
        break;
      case '06':
        status = 'Motor doesn’t exist';
        break;
      case '07':
        status = 'Elevator error';
        break;
      case '10':
        status = 'Elevator is ascending';
        break;
      case '11':
        status = 'Elevator is descending';
        break;
      case '12':
        status = 'Elevator ascending error';
        break;
      case '13':
        status = 'Elevator descending error';
        break;
      case '14':
        status = 'Microwave delivery door is closing';
        break;
      case '15':
        status = 'Microwave delivery door closing error';
        break;
      case '16':
        status = 'Microwave inlet door is opening';
        break;
      case '17':
        status = 'Microwave inlet door opening error';
        break;
      case '18':
        status = 'Pushing lunch box into microwave';
        break;
      case '19':
        status = 'Microwave inlet door is closing';
        break;
      case '20':
        status = 'Microwave inlet door closing error';
        break;
      case '21':
        status = 'Don’t detect lunch box in microwave';
        break;
      case '22':
        status = 'Lunch box is heating';
        break;
      case '23':
        status = 'Lunch box heating remaining time, second';
        break;
      case '24':
        status = 'Please take out the lunch box (successful purchase)';
        break;
      case '25':
        status = 'Staypole return error';
        break;
      case '26':
        status = 'Microwave delivery door is opening';
        break;
      case '28':
        status = 'Staypole push error';
        break;
      case '29':
        status = 'Elevator entering microwave oven error';
        break;
      case '30':
        status = 'Elevator exiting microwave oven error';
        break;
      case '31':
        status = 'Pushrod pushing error in microwave oven';
        break;
      case '32':
        status = 'Pushrod returing error in microwave oven';
        break;
      case '40':
        status = 'product was picked up from delivery box';
        break;
      case '41':
        status = 'delivery door is opened';
        break;
      case '42':
        status = 'delivery door is closed';
        break;
      default:
        'Unknown Status';
    }
    data.statusText = status;
  } else if (data.command == '11') {
    data.title = 'Selection Price, Inventory, Capacity And Product ID';
    data.selectionNumber = vmcCmd.base10(txt.substring(s, (s += 4))).toString();
    data.selectionPrice = vmcCmd.base10(txt.substring(s, (s += 8))).toString();
    data.selectionInventory = txt.substring(s, (s += 2));
    data.selectionCapacity = txt.substring(s, (s += 2));
    data.selectionCommodityNumber = txt.substring(s, (s += 4));
    data.selectionStatus = txt.substring(s);
  } else if (data.command == '21') {
    data.title = 'Receives Money';
    data.mode = vmcCmd.base10(txt.substring(s, (s += 2)));
    data.amount = txt !== '' ? vmcCmd.base10(txt.substring(s, (s += 8))) : '';
    data.cardNumber = txt.substring(s);
    let txtMode = '';
    switch (data.mode.toString()) {
      case '1':
        txtMode = 'Bill';
        break;
      case '2':
        txtMode = 'Coin';
        break;
      case '3':
        txtMode = 'IC card';
        break;
      case '4':
        txtMode = 'Bank card';
        break;
      case '5':
        txtMode = 'Wechat payment';
        break;
      case '6':
        txtMode = 'Alipay';
        break;
      case '7':
        txtMode = 'Jingdong Pay';
        break;
      case '8':
        txtMode = 'Swallowing money';
        break;
      case '9':
        txtMode = 'Union scan pay';
        break;
      default:
        'Unknown Mode';
    }
    data.modeText = txtMode;
  } else if (data.command == '23') {
    data.title = 'Current Amount';
    data.amount = vmcCmd.base10(txt);
  } else if (data.command == '26') {
    data.title = 'Returns Amount VMC Gives';
    data.billChange = vmcCmd.base10(txt.substring(s, (s += 8)));
    data.coinChange = vmcCmd.base10(txt.substring(s));
  } else if (data.command == '29') {
    data.title = 'Sets whether notes and coins are Received';
    data.status = txt.substring(s);
    data.statusText =
      data.status == '00'
        ? 'setting succeeded'
        : data.status == '01'
        ? 'setting failed'
        : 'Unknown';
  } else if (data.command == '52') {
    data.title = 'Acquire Machine Status';
    data.billAcceptStatus = txt.substring(s, (s += 2));
    data.billAccept = data.billAcceptStatus == '00' ? 'yes' : 'no';
    data.coinAcceptStatus = txt.substring(s, (s += 2));
    data.coinAccept = data.coinAcceptStatus == '00' ? 'yes' : 'no';
    data.cardReaderStatus = txt.substring(s, (s += 2));
    data.cardReader = data.cardReaderStatus == '00' ? 'yes' : 'no';
    data.temperatureControllerStatus = txt.substring(s, (s += 2));
    data.temperatureController =
      data.temperatureControllerStatus == '00' ? 'yes' : 'no';
    data.temperature = txt.substring(s, (s += 2));
    data.temperatureText =
      data.temperature != '' ? vmcCmd.base10(data.temperature) : '';
    data.doorStatus = txt.substring(s, (s += 2));
    data.doorStatusText = data.doorStatus == '00' ? 'close' : 'open';
    data.billChange = txt.substring(s, (s += 8));
    data.billChangeText = vmcCmd.base10(data.billChange);
    data.coinChange = txt.substring(s, (s += 8));
    data.coinChangeText = vmcCmd.base10(data.coinChange);
    data.machineIdNumber = txt.substring(s, (s += 20));
    data.machineTemperature = txt.substring(s, (s += 2));
    data.machineTemperatureText =
      data.machineTemperature != ''
        ? vmcCmd.base10(data.machineTemperature)
        : '';
    data.machineHumidity = txt.substring(s);
  } else if (data.command == '71') {
    data.commandType = txt.substring(0, (s += 2));
    data.operationType = txt.substring(s, (s += 2));
    data = defineStatusM(data);
  }

  return data;
}

function defineStatusM(data) {
  let s = 0;
  let txt = data.text;
  data.commandType = txt.substring(s, (s += 2));
  data.operationType = txt.substring(s, (s += 2));
  if (data.commandType == '39') {
    data.title = 'Bill Low-change Setting';
    data.status = txt.substring(s, (s += 2));
    data.statusText =
      data.status == '00'
        ? 'Change Completed'
        : data.status == '01'
        ? 'Change Error'
        : 'Unknown';
    data.changeCoinNumber = Number(vmcCmd.base10(txt.substring(s))) / 2;
  } else if (data.commandType == '40') {
    data.title = 'Query Coin Number';
    data.status = txt.substring(s, (s += 2));
    data.statusText =
      data.status == '00'
        ? 'Coin Acceptor Normal'
        : data.status == '01'
        ? 'Coin Acceptor Fully'
        : 'Unknown';
    data.coinAmountText = txt.substring(s, (s += 8));
    data.coinAmount = vmcCmd.base10(data.coinAmountText);
    data.channelAmount = txt.substring(s);
    data.coin1Text = txt.substring(s, (s += 2));
    data.coin1 = vmcCmd.base10(data.coin1Text);
    data.coin5Text = txt.substring(s, (s += 6));
    data.coin5 = vmcCmd.base10(data.coin5Text);
    data.coin10Text = txt.substring(s, (s += 4));
    data.coin10 = vmcCmd.base10(data.coin10Text);
    data.other = txt.substring(s);
  }
  return data;
}

module.exports = vmcCmd;
