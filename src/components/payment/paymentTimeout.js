import * as React from 'react';
import * as RN from 'react-native';
import {Styles} from '../../styles/payment_style';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class PaymentTimeout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeout: 300,
    };
  }

  componentDidMount() {
    this.activeIntervalTimeout = setInterval(this.countdownPayment, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.activeIntervalTimeout);
  }

  countdownPayment = () => {
    var timeout = this.state.timeout;
    timeout -= 1;
    console.log(this.state.timeout);
    this.setState({
      timeout: timeout,
    });
    if (timeout <= 0) {
      this.setState({
        timeout: 300,
      });
      clearInterval(this.activeIntervalTimeout);
      const {dismiss} = this.props;
      this.dismiss = dismiss;
      this.dismiss();
    }
  };

  render() {
    return (
      <RN.View style={Styles.timer_container}>
        <RN.View style={Styles.timer_content}>
          <Icon name="clock-outline" size={35} color={'#FF4B2B'} />
          <RN.Text style={Styles.timer_text}> {this.state.timeout}</RN.Text>
        </RN.View>
      </RN.View>
    );
  }
}
