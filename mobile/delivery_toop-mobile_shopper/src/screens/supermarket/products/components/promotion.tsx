import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Typography, Colors} from '../../../../styles';

import DatePicker from 'react-native-datepicker';

import {clearMask, maskRealBeautify} from './../../../../utils';

import {Container, Title, Button, TextButton, Input} from './styles';

interface Props {
  setShowModal: any;
  promotion: any;
  setPromotion: any;
}

const Promotion = ({setShowModal, promotion, setPromotion}: Props) => {
  return (
    <Container>
      <Title>Iniciar promoção</Title>
      <ScrollView style={{padding: 50}}>
        <View style={styles.container}>
          <Text style={styles.radioText}>VALOR PROMOCIONAL</Text>
          <Input
            focusable={true}
            underlineColorAndroid="transparent"
            autoCorrect={false}
            numberOfLines={1}
            autoCompleteType="off"
            keyboardType="numeric"
            value={promotion?.pricePromotion ?? 0}
            onChangeText={(value: any) => {
              setPromotion({
                ...promotion,
                pricePromotion: maskRealBeautify(value),
              });
            }}
            style={[styles.input, {marginRight: 5}]}
          />
        </View>

        <View style={styles.container}>
          <Text style={styles.radioText}>INÍCIO DA PROMOÇÃO</Text>

          <DatePicker
            style={{width: '100%'}}
            mode="date"
            placeholder="Selecione"
            format="DD/MM/YYYY"
            confirmBtnText="Confirmar"
            cancelBtnText="Cancelar"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              dateInput: {
                color: Colors.GREY,
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_BOLD,

                borderRadius: 5,

                borderColor: Colors.GRAY_LIGHT,
                borderWidth: 1,

                backgroundColor: Colors.GREY_BACKGROUND,
                height: 50,
              },
            }}
            date={promotion?.dateInitPricePromotion ?? ''}
            onDateChange={(date: string) => {
              setPromotion({
                ...promotion,
                dateInitPricePromotion: date,
              });
            }}
          />
        </View>

        <View style={styles.container}>
          <Text style={styles.radioText}>FIM DA PROMOÇÃO</Text>
          <DatePicker
            style={{width: '100%'}}
            mode="date"
            placeholder="Selecione"
            format="DD/MM/YYYY"
            confirmBtnText="Confirmar"
            cancelBtnText="Cancelar"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              dateInput: {
                color: Colors.GREY,
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_BOLD,

                borderRadius: 5,

                borderColor: Colors.GRAY_LIGHT,
                borderWidth: 1,

                backgroundColor: Colors.GREY_BACKGROUND,
                height: 50,
              },
            }}
            date={promotion?.dateFinishPricePromotion ?? ''}
            onDateChange={(date: string) => {
              setPromotion({
                ...promotion,
                dateFinishPricePromotion: date,
              });
            }}
          />
        </View>
      </ScrollView>
      <Button onPress={() => setShowModal(false)}>
        <TextButton>Salvar</TextButton>
      </Button>
    </Container>
  );
};

export default Promotion;

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
