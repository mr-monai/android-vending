import * as React from 'react';

export default class ShelfTimeout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeout: 60,
    };
  }

  componentDidMount() {
    this.shelfIntervalTimeout = setInterval(this.countdownPayment, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.shelfIntervalTimeout);
  }

  countdownPayment = () => {
    var timeout = this.state.timeout;
    timeout -= 1;
    this.setState({
      timeout: timeout,
    });
    console.log(this.state.timeout);
    if (timeout <= 0) {
      this.setState({
        timeout: 60,
      });
      clearInterval(this.shelfIntervalTimeout);
      const {onTimeout} = this.props;
      this.onTimeout = onTimeout;
      this.onTimeout();
    }
  };

  render() {
    return <></>;
  }
}
