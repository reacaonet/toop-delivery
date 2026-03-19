import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../../../styles';

export const PreLocation = ({ title, icon, navigation }: any) => {
  const goTo = (destiny: any) =>
    navigation.navigate(destiny, { screen: destiny });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => goTo('SelectRide')}>
      {icon}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: Colors.GREY_BACKGROUND,
  },
  text: {
    color: Colors.GREY,
    fontSize: 14,
    marginLeft: 16,
  },
});
