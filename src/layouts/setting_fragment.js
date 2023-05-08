import * as React from 'react';
import * as RN from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useRecoilState, useSetRecoilState} from 'recoil';
import * as navigate from '../navigator/RootNavigation';
import Modal from 'react-native-modal';
import {Styles} from '../styles/setting_style';
import POST from '../protocol';
import STORE from '../storage';
import * as GLOBAL from '../globalState';
import RNRestart from 'react-native-restart'; // Import package from node modules
import {openSettings} from 'react-native-permissions';
const maincontroll = require('../../maincontroll');

const Setting = () => {
  const onSetToken = useSetRecoilState(GLOBAL.TOKEN);
  const onSetKioskID = useSetRecoilState(GLOBAL.KIOSKID);
  const onSetRegisterKey = useSetRecoilState(GLOBAL.REGISTERKEY);

  const [kioskID, setKioskID] = React.useState('');
  const [registerKey, setRegisterKey] = React.useState('');
  const [COIN, setCOIN] = React.useState(false);
  const [BILL, setBILL] = React.useState(false);
  const [reloadData, setReloadData] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [slots, setSlots] = React.useState([]);
  const [slotsTemp, setSlotsTemp] = React.useState([]);
  const [selectedMode, setSelectedMode] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    var views = [];
    for (let i = 0; i < 60; i++) {
      views.push({
        slot: i + 1,
        color: '#fff',
      });
    }
    setSlots(views);
    setSlotsTemp(views);
    maincontroll.on('dispense', res => {
      console.log('dispense status:', res);
    });
    maincontroll.setcoinaccept(false, res => {
      console.log('COIN:', res);
      maincontroll.setbillaccept(false, res2 => {
        console.log('BILL:', res2);
        runApp();
      });
    });
  }, []);

  const runApp = async () => {
    STORE.getItem('KIOSKID', response => {
      console.log('KIOSKID', response);
      if (response.result) {
        setKioskID(response.data);
        onSetKioskID(response.data);
        STORE.getItem('REGISTERKEY', response2 => {
          console.log('REGISTERKEY', response2.data);
          if (response2.result) {
            setRegisterKey(response2.data);
            onSetRegisterKey(response2.data);
          }
        });
      }
    });
  };

  const onSaveKiosk = () => {
    setIsLoading(true);
    var postdata = {
      kioskID: kioskID,
      registerKey: registerKey,
    };
    POST.register(postdata, async callback => {
      console.log(callback);
      if (callback.code === 200 && callback.data) {
        setIsLoading(false);
        await thisSetToken(callback.data.token);
        await thisSetKiosk(kioskID);
        await thisSetRegisterkey(registerKey);
      } else {
        setIsLoading(false);
      }
    });
  };

  const thisSetToken = async token => {
    STORE.setItem('TOKEN', token, response => {
      if (response.result) {
        onSetToken(response.data);
      }
    });
  };

  const thisSetKiosk = async data => {
    STORE.setItem('KIOSKID', data, response => {
      if (response.result) {
        onSetKioskID(data);
      }
    });
  };

  const thisSetRegisterkey = async data => {
    STORE.setItem('REGISTERKEY', data, response => {
      if (response.result) {
        onSetRegisterKey(data);
      }
    });
  };

  const controlCoin = () => {
    if (COIN) {
      maincontroll.setcoinaccept(false, res => {
        console.log('COIN:', res);
        setCOIN(false);
      });
      setCOIN(false);
    } else {
      maincontroll.setcoinaccept(true, res => {
        console.log('COIN:', res);
        setCOIN(true);
      });
    }
  };

  const controlBill = () => {
    if (BILL) {
      maincontroll.setbillaccept(false, res => {
        console.log('BILL:', res);
        setBILL(false);
      });
    } else {
      maincontroll.setbillaccept(true, res => {
        console.log('BILL:', res);
        setBILL(true);
      });
    }
  };

  const activeSlot = item => {
    var isSlot = slots;
    slots[item - 1].color = '#FDC830';
    console.log(isSlot);
    setSlots(isSlot);
    setReloadData(true);
    setTimeout(() => {
      setReloadData(false);
    }, 10);
    // maincontroll.dispense(Number(item), res => {
    //   console.log(res);
    // });
  };

  const renderItem = ({item}) => (
    <RN.TouchableOpacity
      onPress={() => activeSlot(item.slot)}
      style={{
        width: 90,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: item.color,
        borderRadius: 5,
        margin: 5,
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowOffset: {width: 2, height: 0},
        shadowRadius: 10,
        elevation: 3,
      }}>
      <RN.Text style={{color: '#000'}}>{item.slot}</RN.Text>
    </RN.TouchableOpacity>
  );

  const renderItemTemp = ({item}) => (
    <RN.TouchableOpacity
      disabled={true}
      onPress={() => activeSlot(item.slot)}
      style={{
        width: 90,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: item.color,
        borderRadius: 5,
        margin: 5,
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowOffset: {width: 2, height: 0},
        shadowRadius: 10,
        elevation: 3,
      }}>
      <RN.Text style={{color: '#000'}}>{item.slot}</RN.Text>
    </RN.TouchableOpacity>
  );

  return (
    <LinearGradient
      style={Styles.flex}
      colors={['#C9D6FF', '#E2E2E2', '#C9D6FF']}>
      <RN.ScrollView>
        <RN.View style={Styles.title_cotainer}>
          <RN.View style={Styles.title_content}>
            <RN.Image
              source={require('../../assets/images/setting.png')}
              style={Styles.setting_image}
            />
            <RN.Text style={Styles.title_text}>SETTING</RN.Text>
          </RN.View>
          <RN.View style={Styles.kisok_setting_content}>
            <RN.View style={Styles.kisok_setting_contaniner}>
              <RN.View style={Styles.topic_content}>
                <RN.View style={Styles.title_input_content}>
                  <RN.Text style={Styles.title_input_text}>KIOSK ID</RN.Text>
                </RN.View>
                <RN.TextInput
                  style={Styles.kiosk_input}
                  value={kioskID}
                  onChangeText={setKioskID}
                  keyboardType="number-pad"
                />
              </RN.View>
              <RN.View style={Styles.topic_content}>
                <RN.View style={Styles.title_input_content}>
                  <RN.Text style={Styles.title_input_text}>
                    REGISTER KEY
                  </RN.Text>
                </RN.View>
                <RN.TextInput
                  style={Styles.kiosk_input}
                  value={registerKey}
                  onChangeText={setRegisterKey}
                  keyboardType="number-pad"
                />
              </RN.View>
            </RN.View>
            <RN.TouchableOpacity
              style={Styles.btn_save_content}
              onPress={() => onSaveKiosk()}>
              <RN.Text style={Styles.btn_save_text}>SAVE</RN.Text>
            </RN.TouchableOpacity>
          </RN.View>
        </RN.View>
        <RN.View style={{width: '100%', padding: 20, flexDirection: 'row'}}>
          <RN.TouchableOpacity
            onPress={() => {
              controlCoin();
            }}
            style={{
              width: 150,
              height: 150,
              padding: 20,
              margin: 10,
              backgroundColor: COIN ? 'green' : 'red',
              alignItems: 'center',
              borderRadius: 10,
              shadowColor: 'black',
              shadowOpacity: 0.3,
              shadowOffset: {width: 2, height: 0},
              shadowRadius: 10,
              elevation: 3,
              justifyContent: 'center',
            }}>
            <RN.Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#fff',
              }}>
              Coin {COIN ? 'ON' : 'OFF'}
            </RN.Text>
          </RN.TouchableOpacity>
          <RN.TouchableOpacity
            onPress={() => {
              controlBill();
            }}
            style={{
              width: 150,
              height: 150,
              padding: 20,
              margin: 10,
              backgroundColor: BILL ? 'green' : 'red',
              alignItems: 'center',
              borderRadius: 10,
              shadowColor: 'black',
              shadowOpacity: 0.3,
              shadowOffset: {width: 2, height: 0},
              shadowRadius: 10,
              elevation: 3,
              justifyContent: 'center',
            }}>
            <RN.Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#fff',
              }}>
              Bill {BILL ? 'ON' : 'OFF'}
            </RN.Text>
          </RN.TouchableOpacity>
        </RN.View>
        {/* <RN.Picker
          selectedValue={selectedMode}
          style={{height: 50, width: 150}}
          onValueChange={itemValue => setSelectedMode(Number(itemValue))}>
          <RN.Picker.Item label="Lift + Motor" value="1" />
          <RN.Picker.Item label="Motor" value="2" />
        </RN.Picker> */}
        <RN.View style={{width: '100%', padding: 20, flexDirection: 'row'}}>
          {!reloadData ? (
            <RN.FlatList
              numColumns={10}
              data={slots}
              renderItem={item => renderItem(item)}
            />
          ) : (
            <RN.FlatList
              numColumns={10}
              data={slotsTemp}
              renderItem={item => renderItemTemp(item)}
            />
          )}
        </RN.View>
        <RN.View style={Styles.btn_setting_container}>
          <RN.View style={Styles.btn_settingDevice_container_footer}>
            <RN.TouchableOpacity
              style={Styles.btn_settingDevice_content}
              onPress={() => RN.Linking.openSettings()}>
              <RN.Text style={Styles.btn_settingDevice_text}>
                Device Setting
              </RN.Text>
            </RN.TouchableOpacity>
          </RN.View>
          <RN.View style={Styles.btn_exit_container}>
            <RN.TouchableOpacity
              style={Styles.btn_exit_content}
              onPress={() => {
                RNRestart.Restart();
              }}>
              <RN.Text style={Styles.btn_exit_text}>Exit</RN.Text>
            </RN.TouchableOpacity>
          </RN.View>
        </RN.View>
      </RN.ScrollView>
      <Modal isVisible={isLoading}>
        <RN.View style={Styles.modal_loadding}>
          <RN.ActivityIndicator size={150} color="#fff" />
        </RN.View>
      </Modal>
    </LinearGradient>
  );
};

export default Setting;
