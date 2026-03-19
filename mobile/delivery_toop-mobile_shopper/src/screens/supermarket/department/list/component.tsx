import React, {useEffect, useState} from 'react';
import {ReactReduxContext, connect} from 'react-redux';
import {ScrollView} from 'react-native-gesture-handler';
import {ActivityIndicator, View} from 'react-native';

import OptionsMenu from 'react-native-options-menu';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {useNavigation, useIsFocused} from '@react-navigation/native';

import {
  listDepartmentPaginate,
  deleteDepartment,
  orderUpdateDepartment,
} from './../../../../services/provider/shopping/department';
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

interface Department {
  onPress: any;
  add?: any;
  products?: any;
  id?: number;
  _id?: any[];
  name?: string;
  keyword?: any[];
  showInApp?: boolean;
  status?: boolean;
  company?: String;
  franchise?: String;
  editPost?: any;
  deletePost?: any;
  navigation?: any;
  department?: any;
}

const MoreIcon = require('../../../../assets/images/Ord.png');
const Component: React.FC<Department> = ({onPress, add}: any) => {
  const {store} = React.useContext(ReactReduxContext);
  const {navigate} = useNavigation();
  const isFocused = useIsFocused();

  const company = store.getState()?.authUser?.user?.company;

  const [data, setData] = useState<any[]>([]);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);

  //GET
  const getData = async (showLoad = true) => {
    showLoad ? setLoading(true) : null;
    listDepartmentPaginate(company._id, term).then((response: any) => {
      setData(response.list);
      setLoading(false);
    });
  };

  //SEND_PUT
  const edit = (item: any) => {
    navigate('Edit', {item});
  };

  //DELETE
  const removeData = (_id: string) => {
    deleteDepartment(_id).then((response: any) => getData());
  };

  // UPDATE ORDER
  const handleUpdateOrder = async (items: any[]) => {
    for (let i = 0; i < items.length; i++) {
      await orderUpdateDepartment(items[i].sort_id ?? items[i]._id, {
        order: i + 1,
        company: company._id,
      });
    }
    getData(false);
  };

  useEffect(() => {
    getData();
  }, [isFocused, company._id]);

  const renderItem = ({item, drag, isActive}: any) => {
    return (
      <ScaleDecorator>
        <Contain
          key={item._id}
          onLongPress={drag}
          style={{
            backgroundColor: isActive ? Colors.PRIMARY_LIGHT : Colors.WHITE,
          }}
          onPress={() => navigate('Products', {department: item})}>
          <Text>{item.name}</Text>

          {item.company ? (
            <OptionsMenu
              button={MoreIcon}
              buttonStyle={{
                width: 20,
                height: 20,
                marginRight: 10,
                resizeMode: 'contain',
              }}
              destructiveIndex={1}
              options={['Editar', 'Excluir']}
              actions={[() => edit(item), () => removeData(item._id)]}
            />
          ) : (
            <Image
              style={{marginRight: 10, position: 'relative', marginTop: 0}}
              source={MoreIcon}
            />
          )}
        </Contain>
      </ScaleDecorator>
    );
  };

  return (
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
        placeholder="Departamento"
      />

      <Title>DEPARTAMENTOS</Title>

      <View style={{paddingBottom: 230}}>
        {loading ? (
          <View style={{padding: 50}}>
            <ActivityIndicator size="large" color={Colors.BLUE} />
          </View>
        ) : (
          <DraggableFlatList
            data={data}
            onDragEnd={({data}) => {
              setData(data);
              handleUpdateOrder(data);
            }}
            keyExtractor={(item: any) => item._id}
            renderItem={renderItem}
          />
        )}
      </View>

      <ContainFooter>
        <Button onPress={onPress}>
          <ButtonText>Criar departamento</ButtonText>
        </Button>
        <ButtonSecond onPress={add}>
          <ButtonTextSecond>Adicionar Produto</ButtonTextSecond>
        </ButtonSecond>
      </ContainFooter>
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
