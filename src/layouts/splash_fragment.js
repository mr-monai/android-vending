/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import {Animated} from 'react-native';
import * as RN from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Styles} from '../styles/splash_style';
import * as navigate from '../navigator/RootNavigation';
import STORE from '../storage';
import * as GLOBAL from '../globalState';
import {useSetRecoilState, useRecoilState} from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import POST from '../protocol';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import MQTTConnection from '../MQTTConnection';
import Modal from 'react-native-modal';
import Video from 'react-native-video';
const maincontroll = require('../../maincontroll');
//const maincontroll = require('../../maincontroll');
var optionsMqtt = {};
var countVideo = 0;
export default function Splash() {
  const width = new Animated.Value(250);
  const height = new Animated.Value(250);

  const [onKIOSKID, setOnKIOSKID] = useRecoilState(GLOBAL.KIOSKID);
  const [onREGISTERKEY, setOnREGISTERKRY] = useRecoilState(GLOBAL.REGISTERKEY);
  const [onTOKEN, setOnTOKEN] = useRecoilState(GLOBAL.TOKEN);
  const [onSUBSCRIBE, setOnSUBSCRIBE] = useRecoilState(GLOBAL.SUBSCRIBE);
  const [onPUBLISH, setOnPUBLISH] = useRecoilState(GLOBAL.PUBLISH);
  const [ontopicApiCmd, setOnInventory] = useRecoilState(GLOBAL.topicApiCmd);
  const [isInventory, setIsInventory] = useRecoilState(GLOBAL.inventory);
  const [isPaymentMethod, setIsPaymentMethod] = useRecoilState(
    GLOBAL.payment_method,
  );
  const [ClientData] = useRecoilState(GLOBAL.mqttClient);

  const [onAds, setOnAds] = useRecoilState(GLOBAL.ads);
  const [isReady, setIsReady] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const onSetKioskID = useSetRecoilState(GLOBAL.KIOSKID);
  const onSetRegisterKey = useSetRecoilState(GLOBAL.REGISTERKEY);
  const onSetToken = useSetRecoilState(GLOBAL.TOKEN);
  const onSetOwner = useSetRecoilState(GLOBAL.OWNER);
  const onSetPublish = useSetRecoilState(GLOBAL.PUBLISH);
  const mqttClient = useSetRecoilState(GLOBAL.mqttClient);
  const onSetSubscribe = useSetRecoilState(GLOBAL.SUBSCRIBE);
  const topicCheckIn = useSetRecoilState(GLOBAL.topicCheckIn);
  const topicApiCmd = useSetRecoilState(GLOBAL.topicApiCmd);
  const topicCron = useSetRecoilState(GLOBAL.topicCron);
  const inventory = useSetRecoilState(GLOBAL.inventory);
  const ads = useSetRecoilState(GLOBAL.ads);
  const payment_method = useSetRecoilState(GLOBAL.payment_method);
  const cash_method = useSetRecoilState(GLOBAL.cash_method);
  const category = useSetRecoilState(GLOBAL.category);
  const [isVideo, setIsVideo] = React.useState('');
  const [isVideoReady, setIsVideoReady] = React.useState(false);
  const QRPaymentResult = useSetRecoilState(GLOBAL.QRPaymentResult);
  const inventoryAll = useSetRecoilState(GLOBAL.inventoryAll);

  Animated.loop(
    Animated.timing(width, {
      toValue: 270,
      duration: 1000,
      useNativeDriver: false,
    }),
    Animated.timing(height, {
      toValue: 270,
      duration: 1000,
      useNativeDriver: false,
    }),
  ).start();

  React.useEffect(() => {
    //console.log(maincontroll);
    runApp();
  }, []);

  const runApp = async () => {
    getKisokData(res => {
      console.log('START:::', res);
      if (res) {
        if (isInventory.length <= 0 && isPaymentMethod.length <= 0) {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 50000);
          console.log(optionsMqtt);
          checkToken();
        } else {
          console.log('isInventory:', isInventory);
          console.log('isPaymentMethod:', isPaymentMethod);
          setIsReady(true);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  };

  const getKisokData = cb => {
    var checkKioskID = false;
    var checkRegisterKey = false;
    STORE.getItem('KIOSKID', res1 => {
      if (res1.result) {
        optionsMqtt.kiosk = res1.data;
        onSetKioskID(res1.data);
        checkKioskID = true;
      }
      STORE.getItem('REGISTERKEY', res2 => {
        if (res2.result) {
          optionsMqtt.registerKey = res2.data;
          onSetRegisterKey(res2.data);
          checkRegisterKey = true;
        }
        if (checkKioskID && checkRegisterKey) {
          cb(true);
        } else {
          cb(false);
        }
      });
    });
  };

  const checkToken = async () => {
    var tokendata = await AsyncStorage.getItem('TOKEN');
    console.log('get:', tokendata);
    if (!tokendata) {
      registerServer();
    } else {
      var decodedToken = jwt_decode(tokendata);
      if (decodedToken.exp < moment().unix()) {
        registerServer();
      } else {
        optionsMqtt.token = tokendata;
        optionsMqtt.publish = decodedToken.publish;
        optionsMqtt.subscribe = decodedToken.subscribe;
        onSetToken(tokendata);
        onSetOwner(decodedToken.owner);
        onSetPublish(decodedToken.publish);
        onSetSubscribe(decodedToken.subscribe);
        connectMQTT(tokendata);
        console.log(decodedToken);
      }
    }
  };

  const registerServer = () => {
    var postdata = {
      kioskID: optionsMqtt.kiosk,
      registerKey: optionsMqtt.registerKey,
    };
    POST.register(postdata, callback => {
      console.log('renew token', callback);
      if (callback.code === 200 && callback.data) {
        optionsMqtt.token = callback.data.token;
        optionsMqtt.publish = callback.data.publish;
        optionsMqtt.subscribe = callback.data.subscribe;
        thisSetToken(callback.data.token);
        onSetOwner(callback.data.owner);
        onSetPublish(callback.data.publish);
        onSetSubscribe(callback.data.subscribe);
        connectMQTT(callback.data.token);
      }
    });
  };

  const thisSetToken = token => {
    STORE.setItem('TOKEN', token, response => {
      if (response.result) {
        onSetToken(response.data);
      }
    });
  };

  const connectMQTT = async token => {
    console.log(optionsMqtt);
    setTimeout(() => {
      MQTTConnection.connect(
        optionsMqtt.token,
        String(optionsMqtt.kiosk),
        optionsMqtt.subscribe,
        optionsMqtt.publish,
        topicCheckIn,
        topicApiCmd,
        topicCron,
        mqttClient,
        QRPaymentResult,
        category,
        inventory,
        inventoryAll,
        callback => {
          switch (callback.cmd) {
            case 'setup_inventory':
              inventory(callback.inventory);
              inventoryAll(callback.inventory);
              var arrayCategory = [
                {
                  _id: 'all',
                  categoryName: 'ALL',
                },
              ];
              arrayCategory = arrayCategory.concat(callback.category);
              category(arrayCategory);
              setIsReady(true);
              setIsLoading(false);
              break;
            case 'setup_ads':
              if (callback.config.ads) {
                console.log(callback.config.ads);
                ads(callback.config.ads);
                playVideo();
              }
              break;
            case 'setup_qr_payment_method':
              payment_method(callback.method);
              break;
            case 'close_cash_payment':
              cash_method(callback.cmd);
              break;
          }
        },
      );
    }, 1000);
  };

  const onclickScreen = () => {
    //RN.Alert.alert('ฮันแหน่ ซนนะเรา');
    if (isReady) {
      MQTTConnection.publicCheckin(ClientData);
      navigate.navigate('Shelf');
    } else {
      navigate.navigate('Setting');
    }

    // maincontroll.dispense({slot: 35, lift: true, sensor: true}, res => {
    //   console.log('callback::', res);
    // });
  };

  const playVideo = () => {
    console.log('==>', onAds);
    // if (countVideo + 1 >= onAds.length) {
    //   countVideo = 0;
    //   setIsVideo(onAds[countVideo].url);
    //   setIsVideoReady(true);
    // } else {
    //   setIsVideo(onAds[countVideo].url);
    //   setIsVideoReady(true);
    // }
  };

  return (
    <>
      <LinearGradient
        style={Styles.flex}
        colors={['#021B79', '#2B32B2', '#021B79']}>
        <RN.TouchableOpacity
          style={Styles.btn_screen}
          activeOpacity={1}
          onPress={() => onclickScreen()}>
          <RN.ImageBackground
            source={require('../../assets/images/bg_splash.png')}
            style={Styles.bg_container}
            imageStyle={Styles.bg_image}>
            {!isVideoReady ? (
              <RN.Image
                source={require('../../assets/images/logo.png')}
                style={Styles.logo_image}
              />
            ) : (
              <>
                <RN.Image
                  source={require('../../assets/images/logo.png')}
                  style={Styles.logo_image2}
                />
                <Video
                  source={{
                    uri: 'http://advancevending.net/videos/FarmSalad02.mp4',
                  }}
                  repeat={true}
                  style={Styles.video_container}
                  resizeMode="contain"
                  // onEnd={() => {
                  //   countVideo++;
                  //   playVideo();
                  // }}
                />
              </>
            )}
            <RN.View style={Styles.btn_tap_container}>
              <RN.Text style={Styles.btn_tap_text_en}>
                TAP TO BUY PRODUCT
              </RN.Text>
              <RN.Text style={Styles.btn_tap_text_th}>
                แตะเพื่อซื้อสินค้า
              </RN.Text>
            </RN.View>
            <RN.View style={Styles.icon_container}>
              <Animated.Image
                source={require('../../assets/images/tab_icon.png')}
                style={[Styles.icon_image, {width: width, height: height}]}
              />
            </RN.View>
          </RN.ImageBackground>
        </RN.TouchableOpacity>
      </LinearGradient>
      <Modal isVisible={isLoading} style={Styles.m0} backdropOpacity={0.8}>
        <RN.View style={Styles.modal_loadding}>
          <RN.Image
            source={require('../../assets/images/loadgif.gif')}
            style={Styles.load_inventory_image}
          />
          <RN.Text style={Styles.load_inventory_text}>
            LOADING INVENTORY ...
          </RN.Text>
        </RN.View>
        <RN.View style={Styles.blockBackdrop} />
      </Modal>
    </>
  );
}
