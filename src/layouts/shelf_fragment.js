/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import * as RN from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Signal from '../components/shelf/Signal';
import * as navigate from '../navigator/RootNavigation';
import {Styles} from '../styles/shelf_style';
import Modal from 'react-native-modal';
import {useRecoilState, useSetRecoilState} from 'recoil';
import * as GOLBAL from '../globalState';
import Payment from './payment_dialog';
import StaffMode from '../components/shelf/StaffMode';
import STORE from '../storage';
import Prodshelf from '../components/shelf/Prodshelf';
import Clock from '../components/shelf/Clock';
import ProductRanking from '../components/shelf/ProductRanking';
import ShelfTimeout from '../components/shelf/shelfTimeout';
var timeout = 60;
var nextPage = 0;

export default function Shelf() {
  const [category, setCatagory] = React.useState({});
  const [categoryBtn, setCatagoryBtn] = React.useState('all');
  const [payment, setPayment] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [setting, setSetting] = React.useState(false);
  const [prod, setProd] = React.useState();
  const [CHANGE_MONEY, setCHANGE_MONEY] = useRecoilState(GOLBAL.CHANGE_MONEY);
  const [TRAN_SUCCESS, setTRAN_SUCCESS] = useRecoilState(GOLBAL.TRAN_SUCCESS);
  const [SYNCDATA, setSYNCDATA] = useRecoilState(GOLBAL.SYNCDATA);
  const isSetSYNCDATA = useSetRecoilState(GOLBAL.SYNCDATA);
  const [KIOSKID, setKioskID] = useRecoilState(GOLBAL.KIOSKID);
  const onSetToken = useSetRecoilState(GOLBAL.TOKEN);
  const [categoryData, setCategoryData] = useRecoilState(GOLBAL.category);
  const [inventory, setInventory] = useRecoilState(GOLBAL.inventory);
  const [inventoryAll, setInventoryAll] = useRecoilState(GOLBAL.inventoryAll);
  const isSetInventory = useSetRecoilState(GOLBAL.inventory);
  const [product, setProduct] = React.useState(inventory);
  const [productLog, setProductLog] = React.useState(inventory);
  const [isRank, setIsRank] = React.useState(false);
  const [onSelect, setOnSelect] = React.useState(true);
  const [isScrollShelf, setIsScrollShelf] = React.useState(false);

  React.useEffect(() => {
    nextPage = 0;
    //setIsRank(true);
    category.ALL = {key: 'ALL', data: []};
    categoryData.map(item => {
      category[item.categoryName] = {
        key: item._id,
        data: [],
      };
      inventoryAll.map(prods => {
        if (item._id === prods.category) {
          category[item.categoryName].data.push(prods);
        }
      });
    });
    timeout = 60;
    STORE.getItem('TOKEN', response => {
      if (response.result) {
        onSetToken(response.data);
        setIsConnected(true);
        //this.activeIntervalTimeout = setInterval(timeoutScreenSaver, 1000);
      } else {
        setIsConnected(false);
      }
    });
  }, []);

  const selectCategory = key => {
    console.log('selectCategory');
    var data = [];
    setOnSelect(true);
    if (key === 'all') {
      setCatagoryBtn(key);
      isSetInventory(inventoryAll);
      setTimeout(() => {
        setOnSelect(false);
      }, 100);
    } else {
      inventoryAll.map(item => {
        if (item.category === key) {
          data.push(item);
        }
      });
      isSetInventory(data);
      setCatagoryBtn(key);
      setTimeout(() => {
        setOnSelect(false);
      }, 100);
    }
  };

  const selectProd = item => {
    setProd(item);
    setOnSelect(true);
    // clearInterval(this.activeIntervalTimeout);
    //setTimeout(() => {
    console.log(onSelect);
    setPayment(true);
    //}, 500);
  };

  const cancalPayment = () => {
    // clearInterval(this.activeIntervalTimeout);
    setProduct(inventory);
    console.log('cancalPayment');
    setOnSelect(false);
    setPayment(false);
    timeout = 60;
    // this.activeIntervalTimeout = setInterval(timeoutScreenSaver, 1000);
  };

  const openSetting = () => {
    setOnSelect(true);
    setSetting(true);
  };

  const closeSetting = () => {
    //setOnSelect(false);
    setSetting(false);
    //timeout = 60;
  };

  const closeProductRanking = () => {
    setIsRank(false);
  };

  const timeoutScreenSaver = () => {
    // timeout -= 1;
    // console.log(timeout);
    // if (timeout <= 0) {
    //   clearInterval(this.activeIntervalTimeout);
    //   timeout = 60;
    //   navigate.navigate('Splash');
    // }
    navigate.navigate('Splash');
  };

  const onScrollShelf = () => {
    console.log('onScrollShelf');
    setIsScrollShelf(true);
    setTimeout(() => {
      setIsScrollShelf(false);
    }, 500);
  };

  const onClickItemRanking = id => {
    setIsRank(false);
    const pos = inventory.map(e => e.productId).indexOf(id);
    selectProd(inventory[pos]);
  };

  return (
    <RN.View style={Styles.flex}>
      <LinearGradient
        style={Styles.topbar_container}
        colors={['#021B79', '#2B32B2', '#021B79']}>
        <RN.View style={Styles.w30}>
          <RN.View style={Styles.logo_content}>
            <RN.Image
              source={require('../../assets/images/logo2.png')}
              style={Styles.logo_image}
            />
          </RN.View>
        </RN.View>
        <RN.View style={Styles.topbar_content}>
          <RN.TouchableOpacity
            delayLongPress={5000}
            onLongPress={() => {
              openSetting();
            }}
            style={Styles.btn_setting_vending}
            activeOpacity={1}>
            <RN.Image
              source={require('../../assets/images/vending.png')}
              style={Styles.vending_image}
            />
            <RN.View style={Styles.w90}>
              <RN.Text style={Styles.vending_detail_text}>
                KIOSK : {KIOSKID}
              </RN.Text>
              <RN.Text style={Styles.vending_detail_text}>
                Version : 2.3.0
              </RN.Text>
              <RN.Text style={Styles.vending_detail_text}>
                Internet :{' '}
                {isConnected ? (
                  <RN.Text style={{color: '#16b524'}}>Connected</RN.Text>
                ) : (
                  <RN.Text style={{color: 'red'}}>Disconnected</RN.Text>
                )}
              </RN.Text>
            </RN.View>
          </RN.TouchableOpacity>
        </RN.View>
        <RN.View style={Styles.clock_content}>
          <Clock />
        </RN.View>
        <RN.View style={Styles.signal_content}>
          <Signal />
        </RN.View>
      </LinearGradient>
      <RN.View style={Styles.category_conteiner}>
        <RN.View style={Styles.w20} />
        <RN.ScrollView style={Styles.scroll_category} horizontal={true}>
          {categoryData.map(item => (
            <RN.TouchableOpacity
              style={[
                Styles.btn_category_content,
                {
                  backgroundColor:
                    categoryBtn === item._id ? '#f89400' : '#8f8f8f',
                },
              ]}
              onPress={() => selectCategory(item._id)}>
              <RN.Text style={Styles.btn_category_text}>
                {item.categoryName}
              </RN.Text>
            </RN.TouchableOpacity>
          ))}
        </RN.ScrollView>
      </RN.View>
      <Prodshelf
        product={inventory}
        selectProd={selectProd}
        onScrollShelf={onScrollShelf}
      />
      <LinearGradient
        style={Styles.footbar_container}
        colors={['#021B79', '#2B32B2', '#021B79']}>
        {/* <RN.TouchableOpacity style={Styles.btn_topup_content}>
          <RN.Text>Topup Button</RN.Text>
        </RN.TouchableOpacity> */}
        {!onSelect && !isScrollShelf && (
          <ShelfTimeout onTimeout={timeoutScreenSaver} />
        )}
      </LinearGradient>
      <Modal
        isVisible={payment}
        style={{margin: 0, padding: 70}}
        backdropOpacity={0.8}>
        <Payment dismiss={cancalPayment} prod={prod} />
        <RN.View style={Styles.blockBackdrop} />
      </Modal>
      <Modal isVisible={CHANGE_MONEY}>
        <RN.View style={Styles.modal_changemoney}>
          <RN.Image
            source={require('../../assets/images/change_animation.gif')}
            style={Styles.image_changemoney}
          />
          <RN.Text style={Styles.change_text}>กรุณารับเงินถอน 0 บาท</RN.Text>
        </RN.View>
      </Modal>
      <Modal isVisible={TRAN_SUCCESS}>
        <RN.View style={Styles.modal_changemoney}>
          <RN.Image
            source={require('../../assets/images/mascos_animation.gif')}
            style={Styles.image_changemoney}
          />
        </RN.View>
      </Modal>
      <Modal isVisible={setting}>
        <StaffMode dismiss={closeSetting} />
      </Modal>
      <Modal isVisible={isRank}>
        <ProductRanking
          dismiss={closeProductRanking}
          onClickItemRanking={onClickItemRanking}
        />
      </Modal>
    </RN.View>
  );
}
