import React, {useEffect, useState} from 'react';
import {ReactReduxContext, connect} from 'react-redux';
import {ScrollView} from 'react-native-gesture-handler';
import {ActivityIndicator, View} from 'react-native';

import OptionsMenu from 'react-native-options-menu';
import {useNavigation, useIsFocused} from '@react-navigation/native';

import {
  listCategory,
  deleteCategory,
  updateCategory,
} from './../../../../services/provider/shopping/category';

import {
  Container,
  Image,
  TextInput,
  Title,
  Contain,
  Text,
  IconOrd,
  ContainFooter,
  Button,
  ButtonText,
  ButtonSecond,
  ButtonTextSecond,
} from './styles';

import {Colors} from './../../../../styles';

interface Department {}

const Component: React.FC<Department> = ({}: any) => {
  const {store} = React.useContext(ReactReduxContext);
  const {navigate} = useNavigation();
  const isFocused = useIsFocused();

  const company = store.getState()?.authUser?.user?.company;

  const [data, setData] = useState([]);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);

  //GET
  const getData = async () => {
    setLoading(true);
    listCategory(company._id, term).then((response: any) => {
      setData(response);
      setLoading(false);
    });
  };

  //SEND_PUT
  const edit = (item: any) => {
    navigate('CategoryEdit', {item});
  };

  //DELETE
  const removeData = (_id: string) => {
    setLoading(true);
    deleteCategory(company._id, _id).then((response: any) => getData());
  };

  // PAUSAR
  const handleActivePause = (_id: string, isPaused: boolean) => {
    setLoading(true);
    updateCategory(company._id, _id, {isPaused: !isPaused})
      .then((response) => {
        setLoading(false);
        getData();
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, [isFocused, company._id]);

  const MoreIcon = require('../../../../assets/images/Ord.png');

  return (
    <Container>
      <Container>
        <Image
          source={require('../../../../assets/images/Busca.png')}
          resizeMode="contain"
        />
        <TextInput
          value={term}
          onChangeText={setTerm}
          onEndEditing={getData}
          underlineColorAndroid="transparent"
          placeholder="Nome"
        />

        <Title>CATEGORIAS</Title>
        <ScrollView>
          {loading ? (
            <View style={{padding: 50}}>
              <ActivityIndicator size="large" color={Colors.BLUE} />
            </View>
          ) : (
            <>
              {data.map((item: any) => (
                <Contain
                  key={item._id}
                  onPress={() =>
                    navigate('RestaurantProducts', {
                      category: item,
                    })
                  }>
                  <Text>{item.name}</Text>

                  <OptionsMenu
                    button={MoreIcon}
                    buttonStyle={{
                      width: 18,
                      height: 18,
                      marginRight: 10,
                      resizeMode: 'contain',
                    }}
                    destructiveIndex={1}
                    options={[
                      'Editar',
                      'Excluir',
                      item.isPaused ? 'Ativar' : 'Pausar',
                    ]}
                    actions={[
                      () => edit(item),
                      () => removeData(item._id),
                      () => handleActivePause(item._id, item.isPaused),
                    ]}
                  />
                </Contain>
              ))}
            </>
          )}
        </ScrollView>

        <ContainFooter>
          <Button onPress={() => navigate('CategoryCreate')}>
            <ButtonText>Criar categoria</ButtonText>
          </Button>
          <ButtonSecond onPress={() => navigate('RestaurantAddProduct')}>
            <ButtonTextSecond>Adicionar Produto</ButtonTextSecond>
          </ButtonSecond>
        </ContainFooter>
      </Container>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onGetAuth: () => dispatch({type: 'GET_USER_SAGA'}),
  };
};

const mapStateToProps = ({authUser}: any) => {
  return {
    userAuth: authUser,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
