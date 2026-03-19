import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Colors} from '../../styles';

const CardShadow = (props: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{props.children}</View>
    </View>
  );
};

export default CardShadow;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    shadowColor: Colors.GREY,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 1,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 10,
  },
});
