import React from 'react';
import { View, FlatList } from 'react-native';
import moment from 'moment';
import { useSelector } from 'react-redux';

/** Styles */
import {
  Container,
  ContainerText,
  Text,
  SubText,
  Border,
  Button,
  ButtonContain,
  ButtonContainText,
} from './styles';

/** Util */
import { formatMoney } from '../../../../../utils';

// import { Container } from './styles';

const History: React.FC = ({ booings, plus }: any) => {
  const { configurations = null } = useSelector(state => state);

  return (
    <View>
      {/* CONTAINER 2 */}
      {booings && booings.length > 0 ? (
        <FlatList
          data={booings}
          keyExtractor={(item: any) => item._id.toString()}
          renderItem={({ item }: any) => (
            <Container
              onPress={() => {
                plus(item);
              }}>
              <ContainerText>
                <Text>{moment(item.createdAt).format('DD/MM/YYYY')}</Text>
                <Text>{formatMoney(item?.price, configurations?.coin)}</Text>
              </ContainerText>

              <ContainerText>
                <SubText>{moment(item.createdAt).format('HH:mm')}</SubText>
                <SubText>
                  Gorjeta {formatMoney(0, configurations?.coin)}
                </SubText>
              </ContainerText>

              <Border />
              {item?.driver ? (
                <Button>
                  <ButtonContain>
                    <ButtonContainText>
                      {item?.driver?.vehicleManufacturer}{' '}
                      {item?.driver?.vehicleModel}{' '}
                      {item?.driver?.vehicleNameplate}{' '}
                    </ButtonContainText>
                  </ButtonContain>
                </Button>
              ) : (
                <Button>
                  <ButtonContain>
                    <ButtonContainText>{item?.statusTxt} </ButtonContainText>
                  </ButtonContain>
                </Button>
              )}
            </Container>
          )}
        />
      ) : null}
    </View>
  );
};

export default History;
