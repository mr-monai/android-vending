/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import * as RN from 'react-native';
import {Styles} from '../../styles/qrtype_style';
import {useRecoilState} from 'recoil';
import * as GOLBAL from '../../globalState';

const qr_type = ({selectQrType, product}) => {
  const [paymentMethod] = useRecoilState(GOLBAL.payment_method);
  const [qrMethod, setQrMethod] = React.useState([]);

  console.log(paymentMethod);

  React.useEffect(() => {
    var methods = [];
    paymentMethod.map(item => {
      console.log(item.name, item.active);
      if (item.type === 'qr' && item.active === 1) {
        console.log(methods.map(e => e.type).indexOf(item.type));
        if (methods.map(e => e.type).indexOf(item.type) === -1) {
          var obj = {
            _id: item._id,
            active: 1,
            logo_image: require('../../../assets/images/mascos_qrpayment.png'),
            name: item.name,
            type: item.type,
          };
          methods.push(obj);
        }
      } else if (item.type === 'card' && item.active === 1) {
        var obj = {
          _id: item._id,
          active: 1,
          logo_image: require('../../../assets/images/mascos_cardtpayment.png'),
          name: item.name,
          type: item.type,
        };
        methods.push(obj);
      } else if (item.type === 'other' && item.active === 1) {
        methods.push(item);
      }
    });
    setQrMethod(methods);
    console.log('setQrMethod', qrMethod);
  }, []);

  const renderItem = ({item}) => (
    <>
      <RN.TouchableOpacity
        style={Styles.btn_qr_type}
        onPress={() => onSelectType(item)}>
        <RN.Image style={Styles.image_qr_type} source={item.logo_image} />
      </RN.TouchableOpacity>
    </>
  );

  const onSelectType = item => {
    selectQrType(item);
  };

  return (
    <RN.View style={Styles.container}>
      <RN.View style={Styles.title_content}>
        <RN.Text style={Styles.title_text}>กรุณาเลือกประเภท QR Payment</RN.Text>
      </RN.View>
      <RN.View style={Styles.content}>
        <RN.FlatList
          columnWrapperStyle={Styles.flex_start}
          numColumns={3}
          data={qrMethod}
          renderItem={item => renderItem(item)}
        />
      </RN.View>
    </RN.View>
  );
};

export default qr_type;
