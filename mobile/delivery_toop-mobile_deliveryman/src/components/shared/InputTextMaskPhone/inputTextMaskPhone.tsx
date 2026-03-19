import React, {FunctionComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../styles';
import {TextInputMask} from 'react-native-masked-text';

type InputTextProps = {
  title?: string;
  subTitle?: string;
  value: any;
  setValue: any;
  placeholder?: string;
  autoCapitalize?: string;
  params?: any;
};

const InputTextMaskPhone: FunctionComponent<InputTextProps> = ({
  title,
  subTitle,
  value,
  setValue,
  placeholder,
  autoCapitalize,
  params,
}: InputTextProps) => {
  return (
    <View style={styles.container}>
      {title && title.length > 0 ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}
      {subTitle && subTitle.length > 0 ? (
        <Text style={styles.subTitle}>{subTitle}</Text>
      ) : null}
      <TextInputMask
        options={{
          maskType: 'BRL',
          withDDD: true,
          dddMask: '(99) ',
        }}
        keyboardType="phone-pad"
        type={'cel-phone'}
        style={styles.textInput}
        placeholder={placeholder}
        onChangeText={setValue}
        autoCapitalize={autoCapitalize}
        value={value}
        {...params}
      />
    </View>
  );
};

export default InputTextMaskPhone;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    color: Colors.GREY,
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginBottom: 5,
    marginLeft: 15,
  },
  subTitle: {
    color: Colors.DARK_LIGHT,
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 15,
  },
  textInput: {
    borderWidth: 0.8,
    borderStyle: 'solid',
    borderRadius: 25,
    height: 50,
    borderColor: Colors.DARK_LIGHT,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: Colors.BLACK,
    backgroundColor: Colors.WHITE,
  },
});
