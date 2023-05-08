import {StyleSheet} from 'react-native';

export const Styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '25%',
    alignItems: 'center',
  },
  title_content: {
    width: '100%',
    alignItems: 'flex-start',
    padding: 60,
  },
  title_text: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    width: '100%',
    //alignItems: 'center',
    paddingLeft: '10%',
  },
  btn_qr_type: {
    width: 220,
    height: 220,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 30,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn_qr_type_text: {
    color: '#2b32b2',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    bottom: 15,
  },
  image_qr_type: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  btn_qr_card: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    borderRadius: 30,
    margin: 10,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 10,
    elevation: 3,
  },
  btn_qr_card_container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image_qr_card: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  btn_cancel: {
    width: '60%',
    backgroundColor: 'red',
    borderRadius: 10,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 7},
    shadowRadius: 10,
    elevation: 3,
    marginTop: 50,
  },
  btn_cancel_text: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  w53: {width: '53%'},
  flex_start: {alignItems: 'flex-start'},
});