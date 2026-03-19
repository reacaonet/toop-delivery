import React, {FunctionComponent} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors, Typography} from '../../../styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HeaderScreenProps = {
  title?: string;
  onClose: any;
};

const HeaderScreen: FunctionComponent<HeaderScreenProps> = ({
  title,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onClose()}>
        <Icon name={'navigate-before'} size={40} style={styles.iconStyle} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default HeaderScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  title: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    textAlign: 'center',
    flex: 1,
  },
  iconStyle: {
    color: Colors.PRIMARY,
    marginLeft: 5,
  },
});
