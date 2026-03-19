import React, {FunctionComponent} from 'react';
import {View, Text, TextInput, StyleSheet,Platform} from 'react-native';
import {Colors, Typography} from '../../../styles';

type InputTextProps = {
  title?: string;
  value: any;
  setValue: any;
  placeholder?: string;
  placeholderTextColor?:string;
  params?: any;
  autoCapitalize?: any;
  submitEditing?: any;
  secureTextEntry?: boolean;
  refering?: any;
};

const InputText: FunctionComponent<InputTextProps> = ({
  refering,
  title,
  value,
  setValue,
  placeholder,
  placeholderTextColor,
  autoCapitalize,
  params,
  submitEditing,
  secureTextEntry,
}: InputTextProps) => {
  return (
    <View style={styles.container}>
      {title && title.length > 0 ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}
      <TextInput
        ref={refering ? refering : null}
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#666"
        onChangeText={setValue}
        autoCapitalize={autoCapitalize}
        underlineColorAndroid={'transparent'}
        secureTextEntry={secureTextEntry}
        onSubmitEditing={submitEditing}
        value={value}
        placeholderTextColor="black"
        {...params}
      />
    </View>
  );
};

export default InputText;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    color: Colors.GREY,
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 0.5,
    borderStyle: 'solid',
    borderRadius: 8,
    backgroundColor: Colors.INPUT,
    borderColor: Colors.GREY,
    paddingHorizontal: 10,
    paddingVertical:Platform.OS==="ios"? 10: 0,
    marginBottom: 20,
    height: 40,
  },
});
