import React from 'react';
import AllNavigator from './src/navigator';
import {RecoilRoot} from 'recoil';
import {LogBox} from 'react-native';
const maincontroll = require('./maincontroll');

LogBox.ignoreAllLogs();

export default function App() {
  async function connectMDB() {
    maincontroll.open(res => {
      console.log('open', res);
    });
    setTimeout(() => {
      maincontroll.onready(res => {
        console.log('MODULE ON READY ==>', res);
        maincontroll.setcoinaccept(false, coin_res => {
          console.log('COIN:', coin_res);
        });
        maincontroll.setbillaccept(false, bill_res => {
          console.log('BILL:', bill_res);
        });
      });
    }, 2000);
    //var turnOffCoin = maincontroll.setcoinaccept(false);
    //console.log('COIN:', turnOffCoin);
  }
  React.useEffect(() => {
    connectMDB();
  }, []);
  return (
    <RecoilRoot>
      <AllNavigator />
    </RecoilRoot>
  );
}
