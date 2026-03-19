import React, {FunctionComponent} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Typography} from '../../../styles';

type HeaderTitleProps = {
  navigation?: any;
  title?: string;
};

const HeaderTitle: FunctionComponent<HeaderTitleProps> = ({title}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default HeaderTitle;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: Typography.FONT_SIZE_18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
