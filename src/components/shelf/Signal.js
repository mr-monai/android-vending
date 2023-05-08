import React from 'react';
import {View, Image} from 'react-native';
import {Styles} from '../../styles/signal_style';

export default class Signal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signalLevel: (
        <Image
          source={require('../../../assets/images/signal-lv0.png')}
          style={Styles.signal_image}
        />
      ),
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.getSignal();
    }, 3000);
  }

  getSignal = () => {
    var start = Date.now();
    fetch('https://www.advancevending.net/')
      .then(response => {
        if (response) {
          const pingMS = Date.now() - start;
          if (pingMS >= 0.0 && pingMS <= 99.99) {
            this.setState({
              signalLevel: (
                <Image
                  source={require('../../../assets/images/signal-lv4.png')}
                  style={Styles.signal_image}
                />
              ),
            });
          } else if (pingMS >= 100.0 && pingMS <= 299.99) {
            this.setState({
              signalLevel: (
                <Image
                  source={require('../../../assets/images/signal-lv3.png')}
                  style={Styles.signal_image}
                />
              ),
            });
          } else if (pingMS >= 300.0 && pingMS <= 599.99) {
            this.setState({
              signalLevel: (
                <Image
                  source={require('../../../assets/images/signal-lv2.png')}
                  style={Styles.signal_image}
                />
              ),
            });
          } else if (pingMS >= 600.0 && pingMS <= 1999.99) {
            this.setState({
              signalLevel: (
                <Image
                  source={require('../../../assets/images/signal-lv1.png')}
                  style={Styles.signal_image}
                />
              ),
            });
          } else {
            this.setState({
              signalLevel: (
                <Image
                  source={require('../../../assets/images/signal-lv0.png')}
                  style={Styles.signal_image}
                />
              ),
            });
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    return <View style={Styles.signal_content}>{this.state.signalLevel}</View>;
  }
}
