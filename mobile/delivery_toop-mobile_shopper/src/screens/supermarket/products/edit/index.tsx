import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
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

import {
  clearMask,
  dateToEng,
  dateToPt,
  maskRealBeautify,
  toFloat,
} from './../../../../utils/';

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
  Icon,
  ButtonText,
  Button,
} from './styles';

import {listDepartmentPaginate} from './../../../../services/provider/shopping/department';
import {updateProduct} from './../../../../services/provider/shopping/product';

import Promotion from './../components/promotion';
import KeyWord from './../components/keyWord';
import Dropdown from './../components/Dropdown';

import {Colors} from '../../../../styles';

import pickFile from './../../../../services/camera';

const Add: React.FC = () => {
  let scrollView = React.useRef<any>();
  const nameInput = React.useRef(null);
  const descriptionInput = React.useRef(null);
  const departmentInput = React.useRef(null);
  const barcodeInput = React.useRef(null);
  const priceInput = React.useRef(null);

  const navigation = useNavigation();
  const {params}: any = useRoute();
  const {store} = React.useContext(ReactReduxContext);
  const company = store.getState()?.authUser?.user?.company;

  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [department, setDepartment] = React.useState<iOptions>();
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [barcode, setBarcode] = React.useState('');
  const [price, setPrice] = React.useState<string>('');
  const [promotion, setPromotion] = React.useState<any>({});
  const [departments, setDepartments] = React.useState<iOptions[]>([]);
  const [picture, setPicture] =
    React.useState<{base64?: string; uri?: string}>();

  const [showModalPromotion, setShowModalPromotion] = React.useState(false);
  const [showModalKeywords, setShowModalKeywords] = React.useState(false);

  const loadProduct = () => {
    setName(params?.product?.name);
    setDescription(params?.product?.description);
    setDepartment({
      value: params?.product?.department[0]._id,
      label: params?.product?.department[0].name,
    });
    setKeywords(params?.product?.keywords);
    setBarcode(params?.product?.barcodeBox);
    setPrice(maskRealBeautify(params?.product?.price, true));
    setPromotion({
      pricePromotion: maskRealBeautify(
        params?.product?.pricePromotion ?? 0,
        true,
      ),
      dateInitPricePromotion: dateToPt(
        params?.produc?.dateInitPricePromotion ?? '',
      ),
      dateFinishPricePromotion: dateToPt(
        params?.produc?.dateFinishPricePromotion ?? '',
      ),
    });
    setPicture({uri: params?.product?.images[0]});
  };

  const handleSave = () => {
    if (!picture?.uri) return Alert.alert('Oops', 'Tire uma foto do produto');
    if (!name) return Alert.alert('Oops', 'Informe um nome do produto');
    if (!price) return Alert.alert('Oops', 'Informe o valor do produto');
    if (!department?.value)
      return Alert.alert('Oops', 'Informe o departamento do produto');

    try {
      setSaving(true);
      const data = {
        // barcode: ""
        barcodeBox: barcode,
        dateInitPricePromotion:
          parseInt(clearMask(promotion?.pricePromotion)) > 0
            ? dateToEng(promotion.dateInitPricePromotion)
            : '',
        dateFinishPricePromotion:
          parseInt(clearMask(promotion?.pricePromotion)) > 0
            ? dateToEng(promotion.dateFinishPricePromotion)
            : '',
        department: [
          departments.find((i) => i.value === department.value)?.more,
        ],
        description: description,
        keywords: keywords,
        maximumAmount: 0,
        name: name,
        price: toFloat(price),
        pricePromotion: toFloat(promotion?.pricePromotion ?? 0),
        tabloid: null,
        unity: 'unidade',
        file: [
          picture?.base64 ? {base64: picture?.base64} : {url: picture.uri},
        ],
      };

      updateProduct(company._id, params.product._id, data)
        .then((response) => {
          setSaving(false);
          Alert.alert('Sucesso', 'Produto atualizado com sucesso');
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

  const loadDepartments = () => {
    listDepartmentPaginate(company._id, '').then((response: any) => {
      if (response.list)
        setDepartments(
          response.list.map((i: any) => ({
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

  const handleAddKeywords = (text: string) => {
    if (text) {
      keywords.push(text);
      setKeywords(keywords);
      scrollView.current.scrollToEnd({animated: true});
    }
  };

  const handleRemoveKeywords = (index: number) => {
    setKeywords(keywords.filter((value, i) => i !== index));
  };

  React.useEffect(() => {
    loadDepartments();
  }, [company?._id]);

  React.useEffect(() => {
    if (!params?.product) return navigation.goBack();
    loadProduct();
  }, [params?.product]);

  return (
    <Container>
      <ScrollView ref={scrollView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModalPromotion}
          onRequestClose={() => setShowModalPromotion(false)}>
          <Promotion
            setShowModal={setShowModalPromotion}
            promotion={promotion}
            setPromotion={setPromotion}
          />
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModalKeywords}
          onRequestClose={() => setShowModalKeywords(false)}>
          <KeyWord
            setShowModal={setShowModalKeywords}
            hadleAddKeywords={handleAddKeywords}
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
          onSubmitEditing={() => barcodeInput?.current?.focus()}
        />

        <Contain>
          <Dropdown
            ref={departmentInput}
            options={departments}
            showLabel={false}
            label=""
            search={false}
            onChangeText={(text: any) => {
              setDepartment(text);
              barcodeInput?.current?.focus();
            }}
            value={department?.label}
          />
        </Contain>

        <TextInput
          ref={barcodeInput}
          style={styles.input}
          placeholder="Código de Barras (Caixa)"
          value={barcode}
          onChangeText={setBarcode}
          onSubmitEditing={() => priceInput?.current?.focus()}
        />

        <TextInput
          ref={priceInput}
          style={styles.input}
          placeholder="Preço"
          value={price}
          onChangeText={(e: string) => setPrice((old) => maskRealBeautify(e))}
          onChangeText={(e: string) => setPrice((old) => maskRealBeautify(e))}
        />

        <Contain>
          <Button onPress={() => setShowModalPromotion(true)}>
            {parseInt(clearMask(promotion?.pricePromotion ?? '0')) > 0 ? (
              <ButtonText>
                <Text style={{fontSize: 12, color: Colors.GRAY_DARK}}>
                  Preço promocional R${' '}
                </Text>
                {promotion?.pricePromotion}
              </ButtonText>
            ) : (
              <ButtonText>Iniciar promoção</ButtonText>
            )}
          </Button>
          <ImageSelect
            style={{marginTop: -5}}
            source={require('../../../../assets/images/promo.png')}
          />
        </Contain>

        {/* <Contain>
        <Button onPress={() => setShowModalPromotion(true)}>
          <ButtonText>Adicionar complemento</ButtonText>
        </Button>
        <ImageSelect
          style={{marginTop: -10, marginBottom: 20}}
          source={require('../../../../assets/images/add.png')}
        />
      </Contain> */}

        {/* <SubTitle>Molhos</SubTitle>
      <ContainItem>
        <TextItem>· Catchup R$ 0,25</TextItem>
      </ContainItem>
      <ContainItemTwo>
        <TextItem>· Mostarda R$ 0,25</TextItem>
      </ContainItemTwo>
      <ContainItem>
        <TextItem>· Maionese R$ 0,25</TextItem>
      </ContainItem>

      <SubTitle>Adicionais</SubTitle>
      <ContainItem>
        <TextItem>· Bacon R$ 3,25</TextItem>
      </ContainItem>
      <ContainItemTwo>
        <TextItem>· Salsicha R$ 1,25</TextItem>
      </ContainItemTwo>
      <ContainItem>
        <TextItem>· Ovo R$ 0,25</TextItem>
      </ContainItem> */}

        <Contain>
          <Button onPress={() => setShowModalKeywords(true)}>
            <ButtonText>Adicionar palavra chave</ButtonText>
          </Button>

          <ImageSelect
            style={{marginTop: -10, marginBottom: 20}}
            source={require('../../../../assets/images/add.png')}
          />
        </Contain>
        <PassKey>
          {keywords.map((item, index) => (
            <Pass key={`key-${index}`}>
              <TextPass>{item}</TextPass>
              <TouchableOpacity onPress={() => handleRemoveKeywords(index)}>
                <Icon
                  source={require('../../../../assets/images/Excluir_3.png')}
                />
              </TouchableOpacity>
            </Pass>
          ))}
        </PassKey>
      </ScrollView>
      <Touch style={{marginTop: 10}} onPress={handleSave}>
        <TitleTouch>Salvar produto</TitleTouch>
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
