import {StyleSheet, Dimensions} from 'react-native';
import {Colors, Typography} from '../../../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 10,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInfo: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.BLACK,
  },
  containerOptions: {
    height: 155,
    width: '100%',
    backgroundColor: Colors.BACKGROUND,
  },
  contentText: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 0.5,
    borderColor: Colors.GREY,
    paddingVertical: 10,
    backgroundColor: Colors.BACKGROUND,
    // elevation: 1,
  },
  titleContentText: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_18,
  },
  contentConfirm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    height: 50,
    borderWidth: 0.2,
    borderRadius: 10,
    borderColor: Colors.PRIMARY,
    backgroundColor: '#f0f0f5',
    marginHorizontal: 10,
  },
  buttonConfirm: {
    width: 80,
    height: 80,
    borderRadius: 35,
    borderWidth: 0.5,
    elevation: 3,
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#61dafb',
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  logoStyle: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentClose: {
    marginLeft: 15,
  },
  contentAcept: {
    marginRight: 15,
  },
  btnAbsolute: {
    position: 'absolute',
    bottom: 20,
    left: (Dimensions.get('window').width - 85 / 2) / 2,
  },
  customMarker: {
    top: 0,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderRadius: 5,
    elevation: 5,
  },
  contentBtnInfoSuccess: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnInfoSuccess: {
    backgroundColor: Colors.SUCCESS,
    paddingVertical: 20,
    width: Dimensions.get('window').width - 40,
    flexDirection: 'row',
    borderRadius: 20,
  },
  btnText: {
    textAlign: 'center',
    flex: 1,
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
  },
  containerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
  },
  loading: {
    width: 120,
    height: 120,
  },
  txtLoading: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.WHITE,
  },
});

export default styles;
