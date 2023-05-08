import * as React from 'react';
import * as RN from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import POST from '../../protocol/index';
import {Styles} from '../../styles/qr_style';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {BarIndicator} from 'react-native-indicators';
import ERRORS from '../../msgError';
import BlinkView from './BlinkView';
const maincontroll = require('../../../maincontroll');

export default class qr extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      coinInput: {
        c1: 0,
        c2: 0,
        c5: 0,
        c10: 0,
      },
      billInput: {
        b20: 0,
        b50: 0,
        b100: 0,
        b500: 0,
        b1000: 0,
      },
      transactionID: 0,
      loadQr: true,
      QrPayment: 'data:image/png;base64,',
      loadTran: true,
      LoadDispense: false,
      dispenseError: false,
      errorMsg: '',
      pickupAction: false,
      sold_out: false,
    };
  }

  componentDidMount() {
    var postdata = {
      payment: {
        type: 'ThaiQR',
        price: this.props.product.price.normal,
      },
      slot: {
        col: this.props.product.slot.col,
        row: this.props.product.slot.row,
      },
    };
    console.log(this.state.transactionID);
    POST.postJson('makeTransaction', postdata, callback => {
      if (callback.code === 200) {
        console.log('TRANSACTION:', callback);
        var imageQr = callback.qr.imageWithBase64;
        this.state.QrPayment += imageQr;
        this.setState({
          transactionID: callback.transactionID,
          loadQr: false,
          timer: callback.qr.expireTimeSeconds,
        });
        this.dispenseStatus();
        setTimeout(() => {
          this.timerInterval = setInterval(this.countdownPayment, 1000);
          this.timerIntervalQR = setInterval(this.checkInputQRPayment, 1000);
        }, 1500);
      }
    });
  }

  dispenseStatus = () => {
    maincontroll.on('dispense', res => {
      console.log('dispense status:', res);
      switch (res.code) {
        case '50401':
          this.setState({LoadDispense: true});
          maincontroll.setcoinaccept(false, res2 => {
            console.log('50401 COIN:', res2);
            maincontroll.setbillaccept(false, res3 => {
              console.log('50401 BILL:', res3);
            });
          });
          break;
        case '50402':
          this.setState({LoadDispense: false, sold_out: true});
          this.transactionSuccess();
          break;
        case '50410':
          this.setState({LoadDispense: true});
          break;
        case '50411':
          this.setState({LoadDispense: true, pickupAction: true});
          break;
        case '50441':
          this.setState({LoadDispense: true});
          break;
        case '50403':
          this.setState({
            dispenseError: true,
            errorMsg: ERRORS.msgError(res.code),
          });
          this.refundMoneyTotal();
          break;
        case '50205':
          this.setState({
            dispenseError: true,
            errorMsg: ERRORS.msgError(res.code),
          });
          this.refundMoneyTotal();
          break;
        default:
          break;
      }
    });
  };

  checkInputQRPayment = () => {
    console.log(this.props.QRPaymentResult);
    if (this.props.QRPaymentResult.status === 'success') {
      //maincontroll.dispense(this.props.product.slot.col, res => {
      maincontroll.dispense(Number(37), res => {});
    }
  };

  transactionSuccess = () => {
    clearInterval(this.timerInterval);
    clearInterval(this.timerIntervalQR);
    var postdata = {
      action: 'complete',
      payment: {
        coinStack: {C1: 24, C2: 0, C5: 61, C10: 1},
        type: 'ThaiQR',
        moneyInput: {
          coin: 0,
          bill: 0,
        },
        amount: this.props.product.price.normal,
        changeMoney: 0,
      },
      transactionID: this.state.transactionID,
      kioskStatus: {msg: 'success', code: '2000'},
    };
    POST.postJson('updateTransaction', postdata, callback => {
      console.log('updateTransaction:', callback);
      if (callback.code === 200) {
        const {onPaymentSccess} = this.props;
        this.onPaymentSccess = onPaymentSccess;
        this.onPaymentSccess();
      }
    });
  };

  componentWillUnmount() {
    clearInterval(this.timerInterval);
    clearInterval(this.timerIntervalQR);
  }

  countdownPayment = () => {
    var timeout = this.state.timer;
    timeout -= 1;
    this.setState({
      timer: timeout,
    });
    if (timeout <= 0) {
      clearInterval(this.timerInterval);
      clearInterval(this.timerIntervalQR);
      this.dismiss();
    }
  };

  dismiss = () => {
    if (this.state.transactionID === 0) {
      clearInterval(this.timerInterval);
      clearInterval(this.timerIntervalQR);
      const {dismiss} = this.props;
      this.dismiss = dismiss;
      this.dismiss();
      return;
    }
    var postdata = {
      action: 'cancel',
      payment: {
        coinStack: {C1: 234, C2: 0, C5: 100, C10: 52},
        type: 'ThaiQR',
        moneyInput: {
          coin: this.state.coinInput,
          bill: this.state.billInput,
        },
        amount: this.state.moneyInput,
        changeMoney: this.state.changeMoney,
      },
      transactionID: this.state.transactionID,
    };
    POST.postJson('updateTransaction', postdata, callback => {
      console.log('updateTransaction:', callback);
      clearInterval(this.timerInterval);
      clearInterval(this.timerIntervalQR);
      const {dismiss} = this.props;
      this.dismiss = dismiss;
      this.dismiss();
    });
  };

  render() {
    return (
      <RN.View style={Styles.body_container}>
        <RN.View
          style={[Styles.container, {opacity: this.state.sold_out ? 0.5 : 1}]}>
          {this.state.LoadDispense ? (
            <>
              {this.state.dispenseError ? (
                <RN.View style={Styles.error_container}>
                  <RN.Image
                    source={require('../../../assets/images/vending_error.png')}
                    style={Styles.error_image}
                  />
                  <RN.Text style={Styles.error_text}>
                    เกิดข้อผิดพลาด {this.state.errorMsg}
                  </RN.Text>
                  <RN.Text style={Styles.error_refund_text}>
                    เครื่องกำลังคืนเงินให้ท่าน ...
                  </RN.Text>
                  <RN.Image
                    source={require('../../../assets/images/change_money.gif')}
                    style={Styles.changeMoney_image}
                  />
                </RN.View>
              ) : (
                <RN.View style={Styles.error_container}>
                  <RN.Image
                    source={require('../../../assets/images/vending_process2.gif')}
                    style={Styles.vending_process_image}
                  />
                  <RN.Text style={Styles.vending_process_text}>
                    เครื่องกำลังจ่ายของให้ท่าน ...
                  </RN.Text>
                  <RN.Image
                    source={require('../../../assets/images/down_gif.gif')}
                    style={Styles.down_image}
                  />
                  {this.state.pickupAction && (
                    <BlinkView blinkDuration={400}>
                      <RN.View style={Styles.pickup_container}>
                        <RN.View style={{flexDirection: 'row'}}>
                          <Icon
                            name="hand-holding"
                            size={40}
                            color={'#fff'}
                            style={Styles.icon_pickup}
                          />
                          <RN.Text style={Styles.pickup_text}>
                            {' '}
                            กรุณารับสินค้า
                          </RN.Text>
                        </RN.View>
                      </RN.View>
                    </BlinkView>
                  )}
                </RN.View>
              )}
            </>
          ) : (
            <>
              <RN.View style={Styles.timer_content}>
                <RN.Text style={Styles.timer_title_text}>Payment Time</RN.Text>
                <RN.Text style={Styles.timer_text}>
                  {moment.unix(this.state.timer).format('mm:ss')}
                </RN.Text>
              </RN.View>
              <RN.View style={Styles.product_price_container}>
                <RN.View style={Styles.price_text_content}>
                  <RN.Text style={Styles.price_text}>
                    ฿ {this.props.product.price.normal}
                  </RN.Text>
                </RN.View>
                <RN.View style={Styles.prduct_image_content}>
                  <RN.Image
                    source={{uri: this.props.product.productImage}}
                    style={Styles.product_image}
                  />
                  <RN.Text style={Styles.prduct_name_text}>
                    {this.props.product.productName}
                  </RN.Text>
                </RN.View>
              </RN.View>
              <RN.View style={Styles.qrcode_container}>
                <RN.View style={Styles.qrcode_content}>
                  {this.state.loadQr ? (
                    <BarIndicator color="#021B79" count={5} size={60} />
                  ) : (
                    <RN.Image
                      source={{uri: this.state.QrPayment}}
                      style={Styles.qrcode_image}
                    />
                  )}
                </RN.View>
              </RN.View>
              <RN.View style={Styles.mobile_banking_container}>
                <RN.Image
                  source={require('../../../assets/images/mobile_banking.png')}
                  style={Styles.mobile_banking_image}
                />
              </RN.View>
              <RN.View style={Styles.title_content}>
                <RN.Text style={Styles.title_text}>
                  กรุณาแสกน QR Payment เพื่อชำระสินค้า
                </RN.Text>
              </RN.View>
              <RN.TouchableOpacity
                style={Styles.btn_cancel_container}
                disabled={this.state.sold_out}
                onPress={() => this.dismiss()}>
                <LinearGradient
                  start={{x: 1, y: 0}}
                  style={Styles.btn_cancel_content}
                  colors={['#93291E', '#ED213A', '#93291E']}>
                  <RN.Text style={Styles.btn_cancel_text}>CANCEL</RN.Text>
                </LinearGradient>
              </RN.TouchableOpacity>
              <>
                {this.state.sold_out ? (
                  <RN.Image
                    source={require('../../../assets/images/sold_out.png')}
                    style={{
                      width: 700,
                      height: 160,
                      resizeMode: 'contain',
                      position: 'absolute',
                      top: 350,
                      tintColor: '#8f8f8f',
                      transform: [{rotate: '20deg'}],
                    }}
                  />
                ) : null}
              </>
            </>
          )}
        </RN.View>
      </RN.View>
    );
  }
}
