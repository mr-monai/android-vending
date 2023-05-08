import * as React from 'react';
import * as RN from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as navigate from '../../navigator/RootNavigation';

import {Styles} from '../../styles/staffmode_style';

const StaffMode = ({dismiss}) => {
  const [password, setPassword] = React.useState('');
  const [numpad] = React.useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const renderItem = ({item}) => (
    <RN.TouchableOpacity
      onPress={() => inputPassword(item)}
      style={Styles.btn_numpad}>
      <RN.Text style={Styles.btn_numpad_text}>{item}</RN.Text>
    </RN.TouchableOpacity>
  );

  const inputPassword = num => {
    if (password.length < 6) {
      var str = password;
      str += num;
      setPassword(str);
    }
  };

  const onEnter = () => {
    dismiss();
    navigate.navigate('Setting');
  };

  return (
    <RN.View style={Styles.flex}>
      <LinearGradient
        style={Styles.container}
        colors={['#0F2027', '#203A43', '#0F2027']}>
        <RN.View style={Styles.close_container}>
          <RN.TouchableOpacity onPress={() => dismiss()}>
            <Icon name="close" size={50} color={'#fff'} />
          </RN.TouchableOpacity>
        </RN.View>
        <RN.Text style={Styles.title_text}>STAFF MODE</RN.Text>
        <RN.View style={Styles.inputBox_container}>
          <RN.View style={Styles.inputBox}>
            <RN.Text style={Styles.password_text}>{password}</RN.Text>
          </RN.View>
          <RN.TouchableOpacity
            style={Styles.btn_clear}
            onPress={() => setPassword('')}>
            <RN.Text style={Styles.btn_clear_text}>C</RN.Text>
          </RN.TouchableOpacity>
        </RN.View>
        <RN.View style={Styles.w100}>
          <RN.FlatList
            style={Styles.numpad_container}
            numColumns={3}
            data={numpad}
            renderItem={item => renderItem(item)}
          />
          <RN.View style={Styles.zero_container}>
            <RN.TouchableOpacity
              onPress={() => inputPassword(0)}
              style={[Styles.btn_numpad]}>
              <RN.Text style={Styles.btn_numpad_text}>0</RN.Text>
            </RN.TouchableOpacity>
          </RN.View>
        </RN.View>
        <RN.TouchableOpacity
          style={Styles.btn_enter_content}
          onPress={() => onEnter()}>
          <RN.Text style={Styles.btn_enter_text}>ENTER</RN.Text>
        </RN.TouchableOpacity>
      </LinearGradient>
    </RN.View>
  );
};

export default StaffMode;
