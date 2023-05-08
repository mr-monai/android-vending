import * as React from 'react';
import * as RN from 'react-native';
import {Styles} from '../../styles/shelf_style';
import LinearGradient from 'react-native-linear-gradient';

const ProductRanking = ({dismiss, onClickItemRanking}) => {
  return (
    <RN.View style={Styles.container_product_rank}>
      <RN.ImageBackground
        imageStyle={Styles.rank_title_iamge}
        style={Styles.rank_title_container}
        source={require('../../../assets/images/Red_Banner_Transparent_PNG_Clipart.png')}>
        <RN.Text style={Styles.rank_title_text}>สินค้าขายดี</RN.Text>
      </RN.ImageBackground>
      <RN.View style={Styles.content_product_rank}>
        <RN.View style={Styles.container_rank2}>
          <RN.TouchableOpacity
            style={Styles.content_rank2}
            onPress={() => onClickItemRanking(2027)}>
            <RN.Image
              source={{
                uri: 'https://cdn.advancevending.net/webapi/v1/owner/image/show/products/fcab38a59fbc50fda0f827d8552cf874',
              }}
              style={Styles.product_image_rank2}
            />
          </RN.TouchableOpacity>
          <RN.Image
            source={require('../../../assets/images/rank_no2.png')}
            style={Styles.rank2_image}
          />
        </RN.View>
        <RN.View style={Styles.container_rank1}>
          <RN.TouchableOpacity
            style={Styles.content_rank1}
            onPress={() => onClickItemRanking(2510)}>
            <RN.Image
              source={{
                uri: 'https://cdn.advancevending.net/webapi/v1/owner/image/show/products/91d3e5cafed153637bd297fcbf31117d',
              }}
              style={Styles.product_image_rank1}
            />
          </RN.TouchableOpacity>
          <RN.Image
            source={require('../../../assets/images/rank_no1.png')}
            style={Styles.rank1_image}
          />
        </RN.View>
        <RN.View style={Styles.container_rank3}>
          <RN.TouchableOpacity
            style={Styles.content_rank3}
            onPress={() => onClickItemRanking(2581)}>
            <RN.Image
              source={{
                uri: 'https://cdn.advancevending.net/webapi/v1/owner/image/show/products/6242f91939f6bf8ab189fdb81cbf5063',
              }}
              style={Styles.product_image_rank3}
            />
          </RN.TouchableOpacity>
          <RN.Image
            source={require('../../../assets/images/rank_no3.png')}
            style={Styles.rank3_image}
          />
        </RN.View>
      </RN.View>
      <RN.ImageBackground
        imageStyle={Styles.rank_btn_iamge}
        style={Styles.rank_btn_container}
        source={require('../../../assets/images/Red_Banner_Transparent_PNG_Clipart.png')}>
        <RN.TouchableOpacity
          activeOpacity={1}
          style={Styles.btn_cancel_container}
          onPress={() => dismiss()}>
          <LinearGradient
            style={Styles.btn_cancel_content}
            colors={['#BF953F', '#FCF6BA', '#B38728', '#FBF5B7', '#AA771C']}>
            <RN.Text style={Styles.btn_cancel_text}>ปิด</RN.Text>
          </LinearGradient>
        </RN.TouchableOpacity>
      </RN.ImageBackground>
    </RN.View>
  );
};

export default ProductRanking;
