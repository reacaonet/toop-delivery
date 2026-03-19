import React, {FunctionComponent} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Colors, Typography} from '../../../styles';
import {capitalize} from '../../../utils';

type ButtonDisableProps = {
  title: string;
  load?: boolean;
};

const ButtonDisable: FunctionComponent<ButtonDisableProps> = ({
  title,
  load,
}: ButtonDisableProps) => {
  return (
    <TouchableOpacity style={styles.container} disabled={load}>
      {!load && <Text style={styles.title}>{capitalize(title)}</Text>}
      {load && <ActivityIndicator size="small" color="#FFF" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.DARK_LIGHT,
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

export default ButtonDisable;
