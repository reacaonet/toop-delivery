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
import {updateDepartment} from './../../../../services/provider/shopping/department';
import {Colors} from '../../../../styles';

interface Department {
  id?: number;
  _id?: string;
  name: string;
  keyword: any[];
  suggesteds: string[];
  showInApp: boolean;
  status: boolean;
  company?: String;
  franchise?: String;
}

interface DepartmentProps {
  department: Department;
  navigation: any;
}

const Create: React.FC<DepartmentProps> = () => {
  const {store} = React.useContext(ReactReduxContext);
  const navigate = useNavigation();
  const {params}: any = useRoute();
  const {item} = params;

  const company = store.getState()?.authUser?.user?.company;

  const [name, setName] = useState(item?.name);
  const [suggesteds, setSuggesteds] = useState(
    item?.suggesteds?.join(',') ?? '',
  );
  const [showInApp, setShowInApp] = useState(item?.showInApp);
  const [status, setStatus] = useState(item?.status);

  const [isLoading, setIsLoading] = useState(false);

  const onSubmitUpdate = async () => {
    if (!name)
      return Alert.alert(
        'Campo obrigatório',
        'Por favor informe o nome com pelo menos 4 caracteres',
      );
    if (!suggesteds)
      return Alert.alert(
        'Campo obrigatório',
        'Por favor informe pelo menos uma sugestão',
      );

    setIsLoading(true);
    try {
      const response = await updateDepartment(item._id, {
        name,
        showInApp,
        status,
        company: item?.company,
        suggesteds: suggesteds.split(','),
      });

      setIsLoading(false);
      navigate.goBack();
    } catch (error) {
      console.log('An error has occurred');
    }
    setIsLoading(false);
  };

  return (
    <Container>
      <Title>Nome do departamento</Title>
      <Input
        placeholder="Digite o nome"
        value={name}
        underlineColorAndroid="transparent"
        onChangeText={(index: any) => setName(index)}
      />

      <Title>Sugestões</Title>
      <Input
        placeholder="Separadas por vírgula (,)"
        value={suggesteds}
        underlineColorAndroid="transparent"
        onChangeText={(index: any) => setSuggesteds(index)}
      />

      <View style={styles.viewSwitch}>
        {showInApp ? (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
            MOSTRAR NO APP
          </Text>
        ) : (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>
            NÃO MOSTRAR NO APP
          </Text>
        )}
        <Switch
          trackColor={{
            false: Colors.BLACK,
            true: Colors.SUCCESS,
          }}
          thumbColor={showInApp ? Colors.SUCCESS : Colors.ALERT}
          ios_backgroundColor="#FFFFFF"
          onValueChange={() =>
            setShowInApp((previousState: boolean) => !previousState)
          }
          value={showInApp}
        />
      </View>
      <View style={styles.viewSwitch}>
        {status ? (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>ATIVO</Text>
        ) : (
          <Text style={[styles.txtSwitch, {color: Colors.BLUE}]}>INATIVO</Text>
        )}
        <Switch
          trackColor={{
            false: Colors.BLACK,
            true: Colors.SUCCESS,
          }}
          thumbColor={status ? Colors.SUCCESS : Colors.ALERT}
          ios_backgroundColor="#FFFFFF"
          onValueChange={() =>
            setStatus((previousState: BlobOptions) => !previousState)
          }
          value={status}
        />
      </View>

      <Touch onPress={onSubmitUpdate}>
        {isLoading ? (
          <TitleTouch>
            <ActivityIndicator size="small" color={Colors.WHITE} />
          </TitleTouch>
        ) : (
          <TitleTouch>Concluir</TitleTouch>
        )}
      </Touch>
    </Container>
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
