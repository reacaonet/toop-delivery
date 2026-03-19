import React, {FunctionComponent} from 'react';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../../styles';

type HeaderIconProps = {
  navigation: any;
};

const HeaderIcon: FunctionComponent<HeaderIconProps> = ({
  navigation,
}: HeaderIconProps) => {
  const openMenu = () => {
    navigation.toggleDrawer();
  };
  return <Icon name="menu" size={28} style={styles.icon} onPress={openMenu} />;
};

export default HeaderIcon;

const styles = StyleSheet.create({
  icon: {
    color: Colors.ALERT,
    top: 3,
    left: 5,
    position: 'absolute',
  },
});
