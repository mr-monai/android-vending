import React, {Component} from 'react';
import {Animated, TouchableWithoutFeedback} from 'react-native';

class BlinkView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(1),
    };
  }

  startBlinking = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.opacity, {
          toValue: 0.2,
          duration: this.props.blinkDuration,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.opacity, {
          toValue: 1,
          duration: this.props.blinkDuration,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  stopBlinking = () => {
    this.state.opacity.stopAnimation();
  };

  componentDidMount() {
    this.startBlinking();
  }

  componentWillUnmount() {
    this.stopBlinking();
  }

  render() {
    return (
      <Animated.View style={{opacity: this.state.opacity}}>
        {this.props.children}
      </Animated.View>
    );
  }
}

export default BlinkView;
