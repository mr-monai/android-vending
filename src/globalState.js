const {atom} = require('recoil');

export const CHANGE_MONEY = atom({
  key: 'CHANGE_MONEY',
  default: false,
});

export const TRAN_SUCCESS = atom({
  key: 'TRAN_SUCCESS',
  default: false,
});

export const SYNCDATA = atom({
  key: 'SYNCDATA',
  default: false,
});

export const TOKEN = atom({
  key: 'TOKEN',
  default: '',
});

export const KIOSKID = atom({
  key: 'KIOSKID',
  default: '',
});

export const REGISTERKEY = atom({
  key: 'REGISTERKEY',
  default: '',
});

export const OWNER = atom({
  key: 'OWNER',
  default: '',
});

export const PUBLISH = atom({
  key: 'PUBLISH',
  default: [],
});

export const SUBSCRIBE = atom({
  key: 'SUBSCRIBE',
  default: [],
});

export const topicCheckIn = atom({
  key: 'topicCheckIn',
  default: 'checkin',
});

export const topicApiCmd = atom({
  key: 'topicApiCmd',
  default: '',
});

export const topicCron = atom({
  key: 'topicCron',
  default: '',
});

export const inventory = atom({
  key: 'inventory',
  default: [],
});

export const inventoryAll = atom({
  key: 'inventoryAll',
  default: [],
});

export const ads = atom({
  key: 'ads',
  default: {},
});

export const payment_method = atom({
  key: 'payment_method',
  default: [],
});

export const cash_method = atom({
  key: 'cash_method',
  default: {},
});

export const category = atom({
  key: 'category',
  default: [],
});

export const mqttClient = atom({
  key: 'mqttClient',
  default: {},
});

export const QRPaymentResult = atom({
  key: 'QRPaymentResult',
  default: {},
});

export const CardPaymentResult = atom({
  key: 'CardPaymentResult',
  default: {},
});

export const slotDefault = atom({
  key: 'slotDefault',
  default: [],
});
