import {StyleSheet} from 'react-native';
import {Colors} from './../../../../../../styles/index';

const stylesIndicated = StyleSheet.create({
  BoxIndicated: {
    marginRight: 19,
    marginBottom: 15,
  },
  BoxMax: {
    width: 70,
    height: 70,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  Brand: {
    width: 70,
    minHeight: 70,
    borderRadius: 100,
    backgroundColor: Colors.PRIMARY_DARK,
    borderWidth: 0.1,
    borderColor: Colors.GRAY,
  },
});

export default stylesIndicated;
