import * as React from 'react';
import * as RN from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Styles} from '../../styles/shelf_style';

var nextPage = 0;
var oldPage = 2980;
var scrollTOStatus = 'down';
var offsetY = 0;
export default class Prodshelf extends React.Component {
  constructor(props) {
    super(props);
    this.refScroll = React.createRef();
    this.state = {
      scrollViewHeight: 0,
      nextPage: 0,
      selectProduct: false,
      contentHeight: 0,
    };
  }

  componentDidMount() {
    console.log(this.props.product);
    // nextPage = 0;
    // oldPage = 2980;
    // clearInterval(this.activeIntervalDown);
    // clearInterval(this.activeIntervalUp);
    // setTimeout(() => {
    //   this.activeIntervalDown = setInterval(this.startAutoPlay, 100);
    // }, 2980);
  }

  componentWillUnmount() {
    clearInterval(this.activeIntervalDown);
    clearInterval(this.activeIntervalUp);
  }

  startAutoPlay = () => {
    clearInterval(this.activeIntervalUp);
    oldPage = 2980;
    if (this.refScroll.current) {
      this.refScroll.current.scrollToOffset({
        animated: true,
        offset: 0 + nextPage,
      });
      nextPage = nextPage + 10;
      console.log(
        'UP:',
        nextPage,
        '=',
        nextPage >= 2980 && !this.state.selectProduct,
      );
      if (nextPage >= 2980) {
        clearInterval(this.activeIntervalDown);
        setTimeout(() => {
          nextPage = 0;
          scrollTOStatus = 'up';
          this.activeIntervalUp = setInterval(this.endAutoPlay, 100);
        }, 5000);
      }
    }
  };

  endAutoPlay = () => {
    clearInterval(this.activeIntervalDown);
    nextPage = 0;
    if (this.refScroll.current) {
      this.refScroll.current.scrollToOffset({
        animated: true,
        offset: oldPage - 10,
      });
      oldPage = oldPage - 10;
      console.log('DOWN:', oldPage);
      console.log(
        'DOWN:',
        oldPage,
        '=',
        oldPage <= 0 && !this.state.selectProduct,
      );
      if (oldPage <= 0) {
        clearInterval(this.activeIntervalUp);
        setTimeout(() => {
          oldPage = 2980;
          scrollTOStatus = 'down';
          this.activeIntervalDown = setInterval(this.startAutoPlay, 100);
        }, 5000);
      }
    }
  };

  checkStock = (remain, capacity) => {
    var stock = (remain * 100) / capacity;
    if (stock > 50) {
      return '#2B32B2';
    } else if (stock < 50) {
      return '#e65c00';
    } else if (stock < 20) {
      return '#ED213A';
    }
  };

  onSelectProd = item => {
    clearInterval(this.activeInterval);
    this.setState({selectProduct: true});
    const {selectProd} = this.props;
    this.selectProd = selectProd;
    this.selectProd(item);
  };

  renderItem = ({item}) => (
    <RN.TouchableOpacity
      activeOpacity={1}
      style={Styles.btn_product_container}
      onPress={() => {
        this.onSelectProd(item);
      }}>
      <RN.Image
        source={{uri: item.productImage}}
        style={Styles.product_image}
      />
      {item.price.sale > 0 && (
        <>
          <RN.Image
            source={require('../../../assets/images/sale_ribbon.png')}
            style={Styles.product_image_ribbon}
          />
          <RN.Text style={Styles.product_text_ribbon}>SALE</RN.Text>
        </>
      )}
      <RN.ProgressBarAndroid
        styleAttr="Horizontal"
        animating={true}
        color={this.checkStock(item.allremain, item.allcapacity)}
        indeterminate={false}
        progress={item.allremain / item.allcapacity}
        style={{width: 120, marginTop: 10}}
      />
      <RN.Text
        style={{
          fontSize: 18,
          textAlign: 'center',
          fontWeight: 'bold',
          color: this.checkStock(item.allremain, item.allcapacity),
        }}>
        คงเหลือ: {item.allremain} / {item.allcapacity}
      </RN.Text>
      <RN.View style={Styles.product_name_content}>
        <RN.Text style={Styles.product_name}>{item.productName}</RN.Text>
      </RN.View>
      {item.price.sale > 0 ? (
        <LinearGradient
          colors={['#dd1818', '#ED213A', '#dd1818']}
          style={Styles.product_promotion_content}>
          <RN.Text style={Styles.product_old}>{item.price.normal} ฿</RN.Text>
          <RN.Text style={Styles.product_promotion}>
            {item.price.sale} ฿
          </RN.Text>
        </LinearGradient>
      ) : (
        <RN.View style={Styles.product_price_content}>
          <RN.Text style={Styles.product_price}>{item.price.normal} ฿</RN.Text>
        </RN.View>
      )}
    </RN.TouchableOpacity>
  );

  handleTouchStart = () => {
    // clearInterval(this.activeIntervalUp);
    // clearInterval(this.activeIntervalDown);
    // if (scrollTOStatus === 'down') {
    //   setTimeout(() => {
    //     nextPage = offsetY;
    //     oldPage = 2980;
    //     this.activeIntervalDown = setInterval(this.startAutoPlay, 100);
    //   }, 10000);
    // } else {
    //   setTimeout(() => {
    //     nextPage = 0;
    //     oldPage = offsetY;
    //     this.activeIntervalUp = setInterval(this.endAutoPlay, 100);
    //   }, 10000);
    // }
    const {onScrollShelf} = this.props;
    this.onScrollShelf = onScrollShelf;
    this.onScrollShelf();
  };

  handleScroll = e => {
    offsetY = e.nativeEvent.contentOffset.y;
  };

  render() {
    return (
      <RN.FlatList
        onTouchStart={() => this.handleTouchStart()}
        onScroll={e => this.handleScroll(e)}
        ref={this.refScroll}
        automaticallyAdjustContentInsets={true}
        style={Styles.m5}
        numColumns={3}
        data={this.props.product ? this.props.product : []}
        renderItem={item => this.renderItem(item)}
      />
    );
  }
}
