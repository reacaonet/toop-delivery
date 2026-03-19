import React, {useCallback, useState} from 'react';
import {TouchableOpacity, FlatList} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  styles,
  Area,
  Title,
  ContainIndex,
  Container,
  ImageCard,
  Text,
  SubText,
  ViewCard,
  Recebe,
} from './styles';

/** Util */
import {formatMoney} from '../../../utils';

/** Service */
import {listIndications} from '../../../services/provider/indication/list';

import userAvatar from '../../../assets/images/photo.png';

const Indi = ({navigation}) => {
  const {
    user: {user = null},
    configurations = null,
  } = useSelector(state => state);

  const [list, setList] = useState([]);

  useFocusEffect(
    useCallback(() => {
      listIndications({
        personReceive: user?.person?._id,
      }).then(result => {
        if (result && Array.isArray(result) && result.length > 0) {
          setList(result);
        } else {
          setList([]);
        }
      });
    }, [user]),
  );

  const receiveCredits = () => {
    //
  };

  return (
    <ContainIndex>
      {/*  Header */}
      <Area>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Title>INDICAÇÕES</Title>
      </Area>

      <FlatList
        data={list}
        keyExtractor={item => item._id.toString()}
        renderItem={({item}) => (
          <Container>
            {item?.person?.image ? (
              <ImageCard source={{uri: item?.person?.image}} />
            ) : (
              <ImageCard source={userAvatar} />
            )}
            <ViewCard>
              <Text>{item?.person?.name}</Text>

              <SubText>
                {item?.active !== true ? 'Aguardando primeira viagem \n' : null}

                {item?.active === true && item?.rescued === false
                  ? 'Créditos disponível \n'
                  : null}

                {item?.active === true && item?.rescued === true
                  ? 'Créditos recebido \n'
                  : null}
                {formatMoney(item?.total || 0, configurations?.coin)}
              </SubText>
            </ViewCard>

            {item?.active === true && item?.rescued === false ? (
              <TouchableOpacity onPress={() => receiveCredits()}>
                <Recebe>Receber</Recebe>
              </TouchableOpacity>
            ) : null}
          </Container>
        )}
      />
    </ContainIndex>
  );
};

export default Indi;
