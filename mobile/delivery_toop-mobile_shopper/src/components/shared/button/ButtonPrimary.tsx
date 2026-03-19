import React, {FunctionComponent} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform
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
      style={[styles.container]}
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
    height: 40,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: Colors.GREY,
  },
});

export default ButtonPrimary;
