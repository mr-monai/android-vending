import AsyncStorage from '@react-native-async-storage/async-storage';

const setItem = async (key, data, cb) => {
  console.log('setItem', data);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    cb({
      result: true,
      massage: 'store data success .',
    });
  } catch (error) {
    cb({
      result: false,
      massage: 'store data unsuccess .',
    });
  }
};

const getItem = async (key, cb) => {
  try {
    var value = await AsyncStorage.getItem(key);
    if (value) {
      var callback = {
        result: true,
        data: JSON.parse(value),
      };
      cb(callback);
    } else {
      var callback = {
        result: false,
      };
      cb(callback);
    }
  } catch (error) {
    console.log(key, error);
    cb({
      result: false,
      massage: 'get data unsuccess .',
    });
  }
};

export default {
  setItem,
  getItem,
};
