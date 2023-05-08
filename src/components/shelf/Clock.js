import * as React from 'react';
import * as RN from 'react-native';
import moment from 'moment';
import {Styles} from '../../styles/shelf_style';

const Clock = () => {
  const [time, setTime] = React.useState('');

  setInterval(() => {
    setTime(moment().format('HH:mm'));
  }, 1000);

  return <RN.Text style={Styles.clock}>{time}</RN.Text>;
};

export default Clock;
