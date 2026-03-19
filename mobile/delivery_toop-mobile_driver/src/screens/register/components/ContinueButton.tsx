import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography } from '../../../styles';

interface ContinueButtonProps extends TouchableOpacityProps {
  label?: string;
  loading?: boolean;
}

export function ContinueButton({
  label = 'CONTINUAR',
  loading,
  ...rest
}: ContinueButtonProps) {
  return (
    <View style={styles.continueButtonContainer}>
      <TouchableOpacity style={styles.guest} {...rest}>
        {!loading ? (
          <Text style={styles.guestText}>{label}</Text>
        ) : (
          <ActivityIndicator size="small" color={Colors.WHITE} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  guest: {
    flexShrink: 1,
    width: '100%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 30,
    height: 45,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
    letterSpacing: 1,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  continueButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
