import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, Typography } from '../../../../../styles';

interface RadioButtonProps {
  selected: boolean;
  label: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  label,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.outerCircle}>
        {selected ? <View style={styles.selectedInnerCircle} /> : null}
      </View>
      <Text style={styles.title}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '90%',
    paddingVertical: 16,
  },
  outerCircle: {
    justifyContent: 'center',
    alignItems: 'center',

    width: 20,
    height: 20,
    marginRight: 12,

    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  selectedInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.PRIMARY,
  },
  title: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.BLACK,
  },
});
