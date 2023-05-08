/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import * as RN from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Styles} from '../styles/payment_style';

import Cash from '../components/payment/cash_select';
import Qr from '../components/payment/qr_select';
import CraditCard from '../components/payment/card_select';
import QrType from '../components/payment/qr_type';

import {useRecoilState, useSetRecoilState} from 'recoil';
import * as GOLBAL from '../globalState';
import PaymentTimeout from '../components/payment/paymentTimeout';
import BlinkView from '../components/payment/BlinkView';
const maincontroll = require('../../maincontroll');

const Payment = ({dismiss, prod}) => {
  const [product] = React.useState(prod);
  const [selectPay, setSelectPay] = React.useState(true);
  const [selectCash, setSelectCash] = React.useState(false);
  const [selectQr, setSelectQr] = React.useState(false);
  const [selectCard, setSelectCard] = React.useState(false);
  const [cashAction, setCashAction] = React.useState(false);
  const [prodjammed, setProdjammed] = React.useState(false);

  const [cashStatus] = useRecoilState(GOLBAL.cash_method);
  const TRAN_SUCCESS = useSetRecoilState(GOLBAL.TRAN_SUCCESS);
  const [mqttClient] = useRecoilState(GOLBAL.mqttClient);
  const [QRPaymentResult] = useRecoilState(GOLBAL.QRPaymentResult);
  const setQRPaymentResult = useSetRecoilState(GOLBAL.QRPaymentResult);
  console.log(product.slotID);

  React.useEffect(() => {
    if (cashStatus === 'close_cash_payment') {
      setCashAction(false);
    }
  }, []);

  const onSelectCash = () => {
    console.log(product.slotID);
    maincontroll.selectionnumber(product.slotID, res => {
      console.log('RES===>', res);
      //if (res.code !== '50205') {
      setProdjammed(false);
      setSelectPay(false);
      setSelectQr(false);
      setSelectCash(true);
      setSelectCard(false);
      // } else {
      //   setProdjammed(true);
      // }
    });
  };

  const onSelectQr = payType => {
    maincontroll.selectionnumber(product.slotID, res => {
      // if (res.code !== '50205') {
      //   setProdjammed(false);
      if (payType.type === 'card') {
        setQRPaymentResult({});
        setSelectPay(false);
        setSelectQr(false);
        setSelectCash(false);
        setSelectCard(true);
      } else {
        setQRPaymentResult({});
        setSelectPay(false);
        setSelectQr(true);
        setSelectCash(false);
        setSelectCard(false);
      }
      // } else {
      //   setProdjammed(true);
      // }
    });
  };

  const onCloseSelectPayment = () => {
    setSelectPay(true);
    setSelectCash(false);
    setSelectQr(false);
    setSelectCard(false);
  };

  const onPaymentSccess = () => {
    dismiss();
    setQRPaymentResult({});
    TRAN_SUCCESS(true);
    setTimeout(() => {
      TRAN_SUCCESS(false);
    }, 5000);
  };

  const onPaymentFail = () => {
    dismiss();
    setQRPaymentResult({});
  };

  const onPaymentTimeOut = () => {
    dismiss();
  };

  return (
    <LinearGradient
      style={Styles.flex}
      colors={['#F1F1F1', '#F1F1F1', '#F1F1F1']}>
      <RN.View style={Styles.container}>
        <RN.View style={Styles.product_container}>
          <RN.Image
            source={{
              uri: product.productImage,
            }}
            style={Styles.product_image}
          />
        </RN.View>
        <RN.View style={Styles.product_content}>
          <RN.Text style={Styles.product_name_text}>
            {product.productName}
          </RN.Text>
          <RN.View style={{width: '100%', height: 100}}>
            <RN.ScrollView>
              <RN.Text style={Styles.product_detail_text}>
                {product.description}
              </RN.Text>
            </RN.ScrollView>
          </RN.View>
          <RN.Text style={Styles.product_price_text}>
            ราคา {product.price.normal} บาท
          </RN.Text>
        </RN.View>
        {selectPay && (
          <>
            <RN.View style={Styles.paymentTitle_content}>
              <RN.Text style={Styles.payment_title_text}>
                ชำระด้วยเงินสด :
              </RN.Text>
            </RN.View>
            <RN.View style={Styles.btn_payment_content}>
              <RN.TouchableOpacity
                style={Styles.btn_payment}
                disabled={cashAction}
                onPress={() => onSelectCash()}>
                <RN.Image
                  source={require('../../assets/images/money_th_icon.png')}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={[Styles.cash_image, {opacity: cashAction ? 0.4 : 1}]}
                />
              </RN.TouchableOpacity>
            </RN.View>
            <QrType selectQrType={onSelectQr} product={product} />
            {prodjammed ? (
              <BlinkView blinkDuration={400}>
                <RN.Text
                  style={{
                    color: 'red',
                    fontSize: 22,
                    fontWeight: 'bold',
                    marginTop: 40,
                  }}>
                  มีสินค้าอยู่ในลิฟท์ กรุณานำสินค้าออก
                </RN.Text>
              </BlinkView>
            ) : (
              <RN.View style={{width: '100%', height: 70}} />
            )}
            <PaymentTimeout dismiss={onPaymentTimeOut} />
            <RN.TouchableOpacity
              activeOpacity={1}
              style={Styles.btn_cancel_container}
              onPress={() => dismiss()}>
              <LinearGradient
                start={{x: 1, y: 0}}
                style={Styles.btn_cancel_content}
                colors={['#93291E', '#ED213A', '#93291E']}>
                <RN.Text style={Styles.cancel_text}>CANCEL</RN.Text>
              </LinearGradient>
            </RN.TouchableOpacity>
          </>
        )}
        {selectCash && (
          <RN.View style={Styles.w100}>
            <Cash
              dismiss={onCloseSelectPayment}
              product={product}
              onPaymentSccess={onPaymentSccess}
              onPaymentFail={onPaymentFail}
              mqttClient={mqttClient}
            />
          </RN.View>
        )}
        {selectQr && (
          <RN.View style={Styles.w100}>
            <Qr
              dismiss={onCloseSelectPayment}
              product={product}
              QRPaymentResult={QRPaymentResult}
              onPaymentSccess={onPaymentSccess}
              onPaymentFail={onPaymentFail}
            />
          </RN.View>
        )}
        {selectCard && (
          <RN.View style={Styles.w100}>
            <CraditCard
              dismiss={onCloseSelectPayment}
              product={product}
              QRPaymentResult={QRPaymentResult}
              onPaymentSccess={onPaymentSccess}
              onPaymentFail={onPaymentFail}
            />
          </RN.View>
        )}
      </RN.View>
    </LinearGradient>
  );
};

export default Payment;
