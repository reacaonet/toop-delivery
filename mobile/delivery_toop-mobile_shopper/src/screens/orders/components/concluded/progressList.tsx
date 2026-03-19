import React, { useState, useEffect } from 'react';
import CheckBox from '@react-native-community/checkbox';
import {
  Container,
  Contain,
  AvatarContain,
  Avatar,
  TextContain,
  Text,
  SubText,
  Image,
  SubContain,
  TextSubContain,
  ImageContain,
  ImageMessage,
  DetailsView,
  Number,
  TextData,
  Status,
  Total,
  Credit,
  ViewAddress,
  House,
  Footer,
  Touch,
} from './styles';

import AsyncStorage from '@react-native-community/async-storage';

interface IToDo {
  text: string;
  completed: boolean;
}


const ProgressList: React.FC = ({ navigation }: any) => {

  const [toDoList, setToDos] = useState<IToDo[]>([]);
  const [error, showError] = useState<Boolean>(false);
  const [check, setCheck] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    load();
  });

  function openModal() {
    setModalVisible(!modalVisible);
  }


  const load = async () => {
    await AsyncStorage.getItem('@Myname');

  };

  return (
    <Container>

      <Contain>

        <AvatarContain>
          <Avatar source={require('../../../../assets/images/men.png')} />
          <TextContain>
            <Text>Entregador:</Text>
            <SubText>Roberto Souza</SubText>
          </TextContain>

        </AvatarContain>


      </Contain>

      <Image source={require('../../../../assets/images/line3.png')} />
      <SubContain>
        <TextSubContain>Concluído</TextSubContain>
        {/* <ImageContain style={{marginRight: 100}} source={require('../../../../assets/images/comp.png')}/> */}
      </SubContain>

      <DetailsView>
        <Number>Numero: 6543</Number>
        <TextData>Data: 21 Julho 2020 · 12:25</TextData>
        <Status>Status: Aguardando Entregador</Status>
      </DetailsView>

      <DetailsView>
        <Number>1 Pizza Calabresa</Number>
        <TextData>1 Bacon</TextData>
        <TextData>1 Abacaxi</TextData>
        <TextData style={{ marginTop: 20 }}>Molho a parte</TextData>

      </DetailsView>
      <Total>
        <Number style={{ marginTop: 10 }}>Total</Number>
        <Text>R$ 76,05</Text>
      </Total>
      <Credit>
        <Number>Pagamento: Credito</Number>
      </Credit>

      <ViewAddress>
        <TextData>Endereço de entrega</TextData>
        <House>Casa</House>
        <TextData style={{ marginTop: 10 }}>R. Buriti, 363 - Jardim Mariliza,</TextData>
        <TextData>Goiânia - GO 74885-155 Brasil</TextData>

        <TextData style={{ marginTop: 10 }}>Quadra 30 Lote 4 em frente colegio</TextData>
        <Footer>
          <TextData>Caminho de genios</TextData>
          <ImageContain source={require('../../../../assets/images/home.png')} />
        </Footer>

      </ViewAddress>

    </Container>
  );
};

export default ProgressList;
