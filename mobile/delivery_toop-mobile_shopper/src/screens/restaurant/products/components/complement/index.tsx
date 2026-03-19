import React, {useState} from 'react';

import {
  StyleSheet,
  Switch,
  Text,
  View,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';

import {Container, Title, Input, TitleModal, SubtitleModal} from './styles';

import {Colors} from '../../../../../styles';
import {maskRealBeautify, toFloat, isFloat} from './../../../../../utils/';

interface DepartmentProps {
  setShowModal: any;
  complement: any[{}];
  setComplement: any;
}

const Create: React.FC<DepartmentProps> = ({
  setShowModal,
  complement,
  setComplement,
}) => {
  const [name, setName] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [isQuantified, setIsQuantified] = useState(false);
  const [amountMin, setAmountMin] = useState('1');
  const [amountMax, setAmountMax] = useState('1');
  const [position, setPosition] = useState('1');

  const handleAddComplement = () => {
    complement?.data?.items?.push({});

    setComplement({...complement, change: !complement.change});
  };

  const handleAddValue = (
    index: number,
    name: string,
    value: string | boolean,
  ) => {
    setComplement((oldValue: any) => {
      oldValue.data.items[index][name] = value;

      return {...oldValue, change: !oldValue.change};
    });
  };

  const handleRemoveComplement = (index: number) => {
    setComplement((oldValue: any) => {
      const newItems = oldValue.data.items.filter(
        (i: any, ii: number) => ii !== index,
      );

      oldValue.data.items = newItems;

      return {...oldValue, change: !oldValue.change};
    });
  };

  const handleFinish = () => {
    if (!name)
      return Alert.alert('Oops', 'Por favor informe o nome da categoria');
    if (!position)
      return Alert.alert('Oops', 'Por favor informe a posição de exibição');
    if (!amountMin)
      return Alert.alert(
        'Oops',
        'Por favor informe a quantidade mínima de complementos',
      );
    if (!amountMax)
      return Alert.alert(
        'Oops',
        'Por favor informe a quantidade máxima de complementos',
      );

    setShowModal({
      change: complement?.change,
      index: complement?.index,
      data: {
        items: complement?.data?.items
          .filter((i: any) => i.name)
          .map((i: any) => {
            i.price = toFloat(i.price ?? 0);
            i.isPaused = i.isPaused ?? false;
            return i;
          }),
        name,
        isPaused,
        isRequired,
        isQuantified,
        amountMin,
        amountMax,
        position,
      },
    });
  };

  React.useEffect(() => {
    if (complement?.data?.name) {
      setName(complement?.data?.name ?? '');
      setIsPaused(complement?.data?.isPaused ?? false);
      setIsRequired(complement?.data?.isRequired ?? false);
      setIsQuantified(complement?.data?.isQuantified ?? false);
      setAmountMin(complement?.data?.amountMin?.toString() ?? '1');
      setAmountMax(complement?.data?.amountMax?.toString() ?? '1');
      setPosition(complement?.data?.position?.toString() ?? '1');
    }
  }, [complement]);

  return (
    <>
      <TitleModal>Categoria</TitleModal>
      <Container>
        <Title>Nome</Title>
        <Input
          style={{width: '100%'}}
          placeholder="Digite o nome"
          value={name}
          underlineColorAndroid="transparent"
          onChangeText={(index: any) => setName(index)}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <View style={{flex: 1, marginRight: 5}}>
            <Title>Qtd. Mín</Title>
            <Input
              style={{width: '100%'}}
              placeholder=""
              value={amountMin}
              underlineColorAndroid="transparent"
              onChangeText={(index: any) => setAmountMin(index)}
            />
          </View>
          <View style={{flex: 1, marginRight: 5}}>
            <Title>Qtd. Max</Title>
            <Input
              placeholder=""
              style={{width: '100%'}}
              value={amountMax}
              underlineColorAndroid="transparent"
              onChangeText={(index: any) => setAmountMax(index)}
            />
          </View>
          <View style={{flex: 1}}>
            <Title>Posição</Title>
            <Input
              placeholder=""
              style={{width: '100%'}}
              value={position}
              underlineColorAndroid="transparent"
              onChangeText={(index: any) => setPosition(index)}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={styles.viewSwitch}>
            {isPaused ? (
              <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                PAUSAR
              </Text>
            ) : (
              <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                PAUSAR
              </Text>
            )}
            <Switch
              trackColor={{
                false: Colors.BLACK,
                true: Colors.SUCCESS,
              }}
              thumbColor={isPaused ? Colors.SUCCESS : Colors.ALERT}
              ios_backgroundColor="#FFFFFF"
              onValueChange={() =>
                setIsPaused((previousState) => !previousState)
              }
              value={isPaused}
            />
          </View>
          <View style={styles.viewSwitch}>
            {isRequired ? (
              <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                OBRIGATÓRIO
              </Text>
            ) : (
              <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                OBRIGATÓRIO
              </Text>
            )}
            <Switch
              trackColor={{
                false: Colors.BLACK,
                true: Colors.SUCCESS,
              }}
              thumbColor={isRequired ? Colors.SUCCESS : Colors.ALERT}
              ios_backgroundColor="#FFFFFF"
              onValueChange={() =>
                setIsRequired((previousState) => !previousState)
              }
              value={isRequired}
            />
          </View>

          <View style={styles.viewSwitch}>
            {isQuantified ? (
              <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                MÚLTIPLOS ITENS
              </Text>
            ) : (
              <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                MÚLTIPLOS ITENS
              </Text>
            )}
            <Switch
              trackColor={{
                false: Colors.BLACK,
                true: Colors.SUCCESS,
              }}
              thumbColor={isQuantified ? Colors.SUCCESS : Colors.ALERT}
              ios_backgroundColor="#FFFFFF"
              onValueChange={() =>
                setIsQuantified((previousState) => !previousState)
              }
              value={isQuantified}
            />
          </View>
        </View>
        <View
          style={{flexDirection: 'row', alignItems: 'center', paddingTop: 20}}>
          <SubtitleModal style={{flex: 1}}>Complementos</SubtitleModal>
          <TouchableOpacity onPress={handleAddComplement}>
            <Image
              resizeMode="contain"
              source={require('../../../../../assets/images/add.png')}
            />
          </TouchableOpacity>
        </View>
        <View>
          {complement?.data?.items?.map((item: any, index: number) => (
            <View style={styles.complementItem} key={index}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Input
                  placeholder="Digite o nome"
                  value={item?.name}
                  style={{flex: 1, marginRight: 10}}
                  underlineColorAndroid="transparent"
                  onChangeText={(e: string) => handleAddValue(index, 'name', e)}
                />
                <Input
                  placeholder="Cod."
                  value={item.codPdv}
                  style={{width: 100}}
                  underlineColorAndroid="transparent"
                  onChangeText={(e: string) =>
                    handleAddValue(index, 'codPdv', e)
                  }
                />
              </View>

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Input
                  placeholder="Descrição"
                  value={item.description}
                  style={{flex: 1, marginRight: 10}}
                  underlineColorAndroid="transparent"
                  onChangeText={(e: string) =>
                    handleAddValue(index, 'description', e)
                  }
                />
                <Input
                  placeholder="Valor"
                  value={
                    isFloat(item?.price)
                      ? maskRealBeautify(item?.price ?? 0, true)
                      : item?.price
                  }
                  style={{width: 100}}
                  underlineColorAndroid="transparent"
                  onChangeText={(e: string) =>
                    handleAddValue(index, 'price', maskRealBeautify(e))
                  }
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={[
                    styles.viewSwitch,
                    {flex: 1, alignItems: 'flex-start'},
                  ]}>
                  {item?.isPaused ? (
                    <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                      PAUSAR
                    </Text>
                  ) : (
                    <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
                      PAUSAR
                    </Text>
                  )}
                  <Switch
                    trackColor={{
                      false: Colors.BLACK,
                      true: Colors.SUCCESS,
                    }}
                    thumbColor={item?.isPaused ? Colors.SUCCESS : Colors.ALERT}
                    ios_backgroundColor="#FFFFFF"
                    onValueChange={() =>
                      handleAddValue(index, 'isPaused', !item.isPaused)
                    }
                    value={item?.isPaused}
                  />
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.WARNING,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    handleRemoveComplement(index);
                  }}>
                  <Text style={{fontSize: 12}}>REMOVER</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.btnConfirm}
          onPress={() => handleFinish()}>
          <Text style={styles.btnCofirmText}>CONCLUIR</Text>
        </TouchableOpacity>
      </Container>
    </>
  );
};

export default Create;

const styles = StyleSheet.create({
  icon: {
    color: Colors.PRIMARY,

    position: 'absolute',
    marginLeft: 5,
  },
  viewSwitch: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
  },
  txtSwitch: {
    fontSize: 12,
  },
  complementItem: {
    backgroundColor: Colors.GRAY_LIGHT,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  btnConfirm: {
    height: 50,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 25,
  },
  btnCofirmText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
    color: Colors.WHITE,
  },
});
