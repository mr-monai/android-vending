import {StyleSheet} from 'react-native';
import Colors from '../../assets/colors/colors.json';

export const Styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  btn_screen: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg_container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg_image: {
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
    tintColor: Colors.white,
    opacity: 0.1,
  },
  logo_image: {
    resizeMode: 'contain',
    width: 600,
    height: 600,
  },
  logo_image2: {
    resizeMode: 'contain',
    width: 400,
    height: 400,
  },
  btn_tap_container: {
    width: '60%',
    padding: 30,
    borderWidth: 10,
    borderColor: Colors.white,
    borderRadius: 20,
  },
  btn_tap_text_en: {
    textAlign: 'center',
    fontSize: 40,
    color: Colors.white,
    fontWeight: 'bold',
  },
  btn_tap_text_th: {
    textAlign: 'center',
    fontSize: 30,
    color: Colors.white,
    fontWeight: 'bold',
    paddingTop: 15,
  },
  icon_container: {
    width: '75%',
    alignItems: 'flex-end',
  },
  icon_image: {
    tintColor: Colors.yellow,
  },
  modal_loadding: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video_container: {
    //backgroundColor: '#000',
    width: '100%',
    height: 600,
    marginTop: '5%',
    marginBottom: '15%',
  },
  load_inventory_image: {
    resizeMode: 'contain',
    width: 400,
    height: 400,
  },
  load_inventory_text: {
    textAlign: 'center',
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    //bottom: 140,
  },
  blockBackdrop: {
    width: '100%',
    height: '2.9%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  m0: {margin: 0},
});
