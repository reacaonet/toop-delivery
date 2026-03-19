import React, {FunctionComponent} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Colors, Typography} from '../../../styles';
import {capitalize} from '../../../utils';

type ButtonPrimaryProps = {
  title: string;
  onPress: any;
  load?: boolean;
};

const ButtonPrimary: FunctionComponent<ButtonPrimaryProps> = ({
  title,
  onPress,
  load,
}: ButtonPrimaryProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress()}
      disabled={load}>
      {!load && <Text style={styles.title}>{capitalize(title)}</Text>}
      {load && <ActivityIndicator size="small" color="#FFF" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
});

export default ButtonPrimary;
