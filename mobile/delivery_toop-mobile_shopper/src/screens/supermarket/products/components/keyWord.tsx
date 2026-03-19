import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Typography, Colors} from '../../../../styles';

import DatePicker from 'react-native-datepicker';

import {clearMask, maskRealBeautify} from './../../../../utils';

import {Container, Title, Button, TextButton, Input} from './styles';

interface Props {
  setShowModal: any;
  hadleAddKeywords: any;
}

const Keyword = ({setShowModal, hadleAddKeywords}: Props) => {
  const [text, setText] = React.useState('');

  return (
    <Container>
      <Title>Nova palavra-chave</Title>
      <ScrollView style={{padding: 30}}>
        <View style={styles.container}>
          <Text style={styles.radioText}>
            Adicione palavra chaves para auxiliar em buscas e sugestões
          </Text>
          <Input
            focusable={true}
            underlineColorAndroid="transparent"
            autoCorrect={false}
            numberOfLines={1}
            autoCompleteType="off"
            keyboardType="default"
            value={text}
            onChangeText={setText}
            style={[styles.input, {marginRight: 5}]}
          />
        </View>
      </ScrollView>
      <Button
        onPress={() => {
          hadleAddKeywords(text);
          setShowModal(false);
        }}>
        <TextButton>Adicionar</TextButton>
      </Button>
    </Container>
  );
};

export default Keyword;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    alignItems: 'stretch',
    flexDirection: 'column',

    justifyContent: 'center',
  },
  radioText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.GRAY_DARK,
    alignSelf: 'center',
    marginBottom: 15,
  },

  input: {
    textAlign: 'center',
  },
});
