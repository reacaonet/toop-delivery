import React from 'react';
import {
  Modal,
  Text,
  Image as ImageReact,
  Alert,
  ActivityIndicator,
  View,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import {ReactReduxContext, connect} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import ModalSelector from 'react-native-modal-selector-searchable';

import {iOptions} from '../../../../@types/Dropdown';

import {maskRealBeautify, toFloat} from './../../../../utils/';

import {
  Touch,
  TitleTouch,
  Container,
  ViewPhoto,
  Image,
  TextPhoto,
  NameTextInput,
  Contain,
  ImageSelect,
  SubTitle,
  ContainItem,
  ContainItemTwo,
  TextItem,
  PassKey,
  Pass,
  TextPass,
  IconRemove,
  ButtonText,
  Button,
} from './styles';

import {listCategory} from './../../../../services/provider/shopping/category';
import {createProduct} from './../../../../services/provider/shopping/food/product';

import Complement from './../components/complement';

import RemoveItem from '../../../../components/shared/alert/removeItem';

import Dropdown from './../components/Dropdown';

import {Colors} from '../../../../styles';

import pickFile from './../../../../services/camera';
import {TouchableOpacity} from 'react-native-gesture-handler';

const Add: React.FC = () => {
  let scrollview = React.useRef<any>();
  const nameInput = React.useRef(null);
  const descriptionInput = React.useRef(null);
  const categoryInput = React.useRef(null);
  const codPdvInput = React.useRef(null);
  const priceInput = React.useRef(null);
  const pricePromotionInput = React.useRef(null);

  const navigation = useNavigation();
  const {params}: any = useRoute();
  const {store} = React.useContext(ReactReduxContext);
  const company = store.getState()?.authUser?.user?.company;

  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<iOptions>();
  const [codPdv, setCodPdv] = React.useState('');
  const [price, setPrice] = React.useState<string>('');
  const [pricePromotion, setPricePromotion] = React.useState<string>('');
  const [complements, setComplements] = React.useState<any>({
    change: true,
    data: [],
  });
  const [complement, setComplement] = React.useState<any>({
    change: true,
    index: 0,
    data: {items: []},
  });
  const [categories, setCategories] = React.useState<iOptions[]>([]);
  const [complementRemoveIndex, setComplementRemoveIndex] =
    React.useState<number>();

  const [picture, setPicture] =
    React.useState<{base64?: string; uri?: string}>();

  const [showModalComplement, setShowModalComplement] = React.useState(false);
  const [showModalRemoveComplement, setShowModalRemoveComplement] =
    React.useState(false);

  const handleSave = () => {
    if (!picture?.uri) return Alert.alert('Oops', 'Tire uma foto do produto');
    if (!name) return Alert.alert('Oops', 'Informe um nome do produto');
    if (!price) return Alert.alert('Oops', 'Informe o valor do produto');
    if (!category?.value)
      return Alert.alert('Oops', 'Informe o departamento do produto');

    try {
      setSaving(true);
      const data = {
        codPdv: codPdv,
        company: company._id,
        category: categories.find((i) => i.value === category.value)?.more,
        description: description,
        name: name,
        price: toFloat(price),
        pricePromotion: toFloat(pricePromotion ?? 0),
        tabloid: null,
        unity: 'unidade',
        file: [{base64: picture?.base64}],
        complements: complements.data,
      };

      console.log({
        codPdv: codPdv,
        company: company._id,
        category: categories.find((i) => i.value === category.value)?.more,
        description: description,
        name: name,
        price: toFloat(price),
        pricePromotion: toFloat(pricePromotion ?? 0),
        tabloid: null,
        unity: 'unidade',
        file: [{base64: picture?.base64}],
        complements: complements.data,
      });

      createProduct(company._id, data)
        .then((response) => {
          setSaving(false);
          Alert.alert('Sucesso', 'Produto cadastrado com sucesso');
          navigation.goBack();
        })
        .catch((err) => {
          console.log('Fail Add Product', err);
          setSaving(false);
          Alert.alert('Oops', 'Não possível adicionar produto');
        });
    } catch (err) {
      console.log('Fail Add Product', err);
      Alert.alert('Oops', 'Não possível adicionar produto');
    }
  };

  const loadCategories = () => {
    listCategory(company._id, '').then((response: any) => {
      setCategories(
        response.map((i: any) => ({
          value: i._id,
          label: i.name,
          more: i,
        })),
      );
    });
  };

  const selectImage = async (type: 'gallery' | 'camera' | any) => {
    const data = await pickFile(type, 'photo');

    if (!data?.uri) {
      return;
    }

    setPicture(data);
  };

  const handleNewComplement = () => {
    complements.data.push({});
    setComplements({change: !complements.change, data: complements.data});

    setComplement({
      change: !complement.change,
      index: complements.data.length - 1,
      data: {items: []},
    });

    setShowModalComplement(true);
  };

  const handleUpdateComplementList = (itemm: any) => {
    const newItems = complements.data.map((item: any, index: number) => {
      if (index === itemm.index) {
        item = itemm.data;
      }

      return item;
    });

    setComplements({change: !complements.change, data: newItems});
    setShowModalComplement(false);
    scrollview.current.scrollToEnd({animated: true});
  };

  const handleRemoveComplement = () => {
    const newItems = complements.data.filter(
      (item: any, index: number) => index !== complementRemoveIndex,
    );

    setComplements({change: !complements.change, data: newItems});
    setShowModalRemoveComplement(false);
  };

  const handleEditComplement = (indexComplement: number) => {
    const item = complements.data.find(
      (item: any, index: number) => index === indexComplement,
    );
    setComplement({
      change: !complement.change,
      index: indexComplement,
      data: item,
    });
    setShowModalComplement(true);
  };

  React.useEffect(() => {
    loadCategories();
    if (params?.category) {
      setCategory({
        value: params?.category._id,
        label: params?.category?.name,
      });
    }
  }, [company?._id]);

  return (
    <Container>
      <ScrollView ref={scrollview}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModalComplement}
          onRequestClose={() => setShowModalComplement(false)}>
          <Complement
            setShowModal={handleUpdateComplementList}
            complement={complement}
            setComplement={setComplement}
          />
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModalRemoveComplement}
          onRequestClose={() => setShowModalRemoveComplement(false)}>
          <RemoveItem
            modal={setShowModalRemoveComplement}
            onConfirm={handleRemoveComplement}
          />
        </Modal>

        <Modal animationType="slide" transparent={true} visible={saving}>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator color={Colors.PRIMARY} size="large" />
            <Text>Salvando produto...</Text>
          </View>
        </Modal>

        <ModalSelector
          search={false}
          cancelText="Cancelar"
          data={[
            {key: 'gallery', label: 'Abrir Galeria'},
            {key: 'camera', label: 'Abrir Câmera'},
          ]}
          onChange={(value) => selectImage(value?.key)}>
          <ViewPhoto>
            {picture?.uri ? (
              <ImageReact
                source={{uri: picture.uri}}
                resizeMode="cover"
                style={{width: 100, height: 100, borderRadius: 100}}
              />
            ) : (
              <Image
                source={require('../../../../assets/images/add_photo.png')}
              />
            )}

            <TextPhoto>Adicionar foto</TextPhoto>
          </ViewPhoto>
        </ModalSelector>

        <NameTextInput
          ref={nameInput}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          onSubmitEditing={() => descriptionInput?.current?.focus()}
        />

        <TextInput
          ref={descriptionInput}
          style={styles.input}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          onSubmitEditing={() => codPdvInput?.current?.focus()}
        />

        <Contain>
          <Dropdown
            ref={categoryInput}
            options={categories}
            showLabel={false}
            label=""
            search={false}
            onChangeText={(text: any) => {
              setCategory(text);
              codPdvInput?.current?.focus();
            }}
            value={category?.label}
          />
        </Contain>

        <TextInput
          ref={codPdvInput}
          style={styles.input}
          placeholder="Código"
          value={codPdv}
          onChangeText={setCodPdv}
          onSubmitEditing={() => priceInput?.current?.focus()}
        />

        <TextInput
          ref={priceInput}
          style={styles.input}
          placeholder="Preço"
          value={price}
          onChangeText={(e: string) => setPrice((old) => maskRealBeautify(e))}
          onSubmitEditing={() => pricePromotionInput?.current?.focus()}
        />

        <TextInput
          ref={pricePromotionInput}
          style={styles.input}
          placeholder="Preço promocional"
          value={pricePromotion}
          onChangeText={(e: string) =>
            setPricePromotion((old) => maskRealBeautify(e))
          }
        />

        <Contain>
          <Button onPress={() => handleNewComplement()}>
            <ButtonText>Adicionar complemento</ButtonText>
          </Button>
          <ImageSelect
            style={{marginTop: -10, marginBottom: 20}}
            source={require('../../../../assets/images/add.png')}
          />
        </Contain>
        {complements.data.map((comp: any, index: number) => {
          if (comp.name) {
            return (
              <View key={index} style={{position: 'relative', marginTop: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <SubTitle style={{flex: 1}}>{comp?.name}</SubTitle>
                  <TouchableOpacity
                    onPress={() => {
                      setComplementRemoveIndex(index);
                      setShowModalRemoveComplement(true);
                    }}
                    style={{marginRight: 25}}>
                    <IconRemove
                      source={require('../../../../assets/images/delete.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleEditComplement(index);
                    }}
                    style={{marginRight: 25}}>
                    <IconRemove
                      source={require('../../../../assets/images/lapis.png')}
                    />
                  </TouchableOpacity>
                </View>
                {comp?.items?.map((item: any) => (
                  <ContainItem>
                    <TextItem>
                      · {item?.name} R${' '}
                      {maskRealBeautify(item.price ?? 0, true)}
                    </TextItem>
                  </ContainItem>
                ))}
              </View>
            );
          }
        })}
      </ScrollView>
      <Touch style={{marginTop: 10}} onPress={handleSave}>
        <TitleTouch>Adicionar produto</TitleTouch>
      </Touch>
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

export default connect(mapStateToProps, mapDispatchToProps)(Add);

const styles = StyleSheet.create({
  input: {
    width: '90%',
    height: 60,
    fontSize: 18,
    marginTop: 20,
    paddingLeft: 30,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: Colors.GRAY_LIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
