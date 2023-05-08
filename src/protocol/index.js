import STORE from '../storage';

const HOST = 'https://api.advancevending.net';

const postJson = (path, postdata, cb) => {
  if (path !== 'register') {
    checkToken(token => {
      var setFunction = eval(path);
      setFunction(postdata, token.token, cb);
    });
  } else {
    var setFunction = eval(path);
    setFunction(postdata, cb);
  }
};

const checkToken = cb => {
  STORE.getItem('TOKEN', RES => {
    console.log(RES);
    if (RES.result) {
      var callback = {
        token: RES.data,
      };
      cb(callback);
    }
  });
};

const register = (postdata, cb) => {
  const url = HOST + '/api/v1/kiosk/register';
  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      //Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(postdata),
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      cb(data);
    })
    .catch(err => {
      cb(false);
      console.error(err);
    });
};

const getProduct = (postdata, token, cb) => {
  const url = HOST + '/api/v1/get/product';
  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(postdata),
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      cb(data);
    })
    .catch(err => {
      cb(false);
      console.error(err);
    });
};

const makeTransaction = (postdata, token, cb) => {
  const url = HOST + '/api/v1/kiosk/transaction';
  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(postdata),
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      cb(data);
    })
    .catch(err => {
      cb(false);
      console.error(err);
    });
};

const updateTransaction = (postdata, token, cb) => {
  const url = HOST + '/api/v1/kiosk/transactionsuccess';
  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(postdata),
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      cb(data);
    })
    .catch(err => {
      cb(false);
      console.error(err);
    });
};

export default {
  postJson,
  register,
  getProduct,
  makeTransaction,
  updateTransaction,
};
