import React, {useState} from 'react';
import {ReactReduxContext} from 'react-redux';

import {useNavigation, useRoute} from '@react-navigation/native';
import {
  StyleSheet,
  Switch,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {Container, Title, Input, Touch, TitleTouch} from './styles';
import {updateCategory} from './../../../../services/provider/shopping/category';
import {Colors} from '../../../../styles';

interface Department {}

interface DepartmentProps {
  navigation?: any;
}

const Update: React.FC<DepartmentProps> = () => {
  const {store} = React.useContext(ReactReduxContext);
  const navigate = useNavigation();
  const {params}: any = useRoute();
  const {item} = params;

  const company = store.getState()?.authUser?.user?.company;

  const [name, setName] = useState(item?.name);
  const [isPaused, setIsPaused] = useState(item?.isPaused);
  const [position, setPosition] = useState(item?.position.toString());
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitUpdate = async () => {
    if (!name)
      return Alert.alert(
        'Campo obrigatório',
        'Por favor informe o nome com pelo menos 4 caracteres',
      );
    if (!position) return Alert.alert('Oops', 'Informe a posição da categoria');

    setIsLoading(true);
    try {
      const response = await updateCategory(company._id, item._id, {
        name,
        isPaused,
        position,
        company: company._id,
      });

      setIsLoading(false);
      navigate.goBack();
    } catch (error) {
      console.log('An error has occurred');
      Alert.alert('Tente novamente', 'Erro ao atualizar categoria');
    }
    setIsLoading(false);
  };

  return (
    <Container>
      <Title>Digite o nome da categoria</Title>
      <Input
        placeholder="Digite o nome"
        value={name}
        underlineColorAndroid="transparent"
        onChangeText={(index: any) => setName(index)}
      />

      <Title>Ordem de exibição</Title>
      <Input
        placeholder=""
        value={position}
        underlineColorAndroid="transparent"
        onChangeText={(index: any) => setPosition(index)}
      />

      <View style={styles.viewSwitch}>
        {isPaused ? (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>EM PAUSA</Text>
        ) : (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>ATIVA</Text>
        )}
        <Switch
          trackColor={{
            false: Colors.BLACK,
            true: Colors.SUCCESS,
          }}
          thumbColor={isPaused ? Colors.SUCCESS : Colors.ALERT}
          ios_backgroundColor="#FFFFFF"
          onValueChange={() => setIsPaused((previousState) => !previousState)}
          value={isPaused}
        />
      </View>

      <Touch onPress={onSubmitUpdate}>
        {isLoading ? (
          <TitleTouch>
            <ActivityIndicator size="small" color={Colors.WHITE} />
          </TitleTouch>
        ) : (
          <TitleTouch>Salvar</TitleTouch>
        )}
      </Touch>
    </Container>
  );
};

export default Update;

const styles = StyleSheet.create({
  icon: {
    color: Colors.PRIMARY,

    position: 'absolute',
    marginLeft: 5,
  },
  viewSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 0,
    marginTop: 25,
    marginBottom: 15,
  },
  txtSwitch: {
    fontSize: 14,
  },
});
