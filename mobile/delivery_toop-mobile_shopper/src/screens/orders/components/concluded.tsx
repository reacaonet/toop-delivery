import React from 'react';

import {
  ContainerList,
  Contain,
  Text,
  SubText,
  SubTextRow,
  ViewText,
  Border,
  Subtitle,
  ButtonContain,
  NoResultsView,
  NoResultsMessage,
} from './styles';

/** Util */
import {formatDateLocal} from '../../../utils';

const Concluded: React.FC<any> = ({
  onConcl,
  show,
  onRefresh,
  list,
  isFetching,
}) => {
  return (
    <>
      {show ? (
        <ContainerList
          initialScrollIndex={0}
          data={list}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any) => item._id}
          onRefresh={() => onRefresh()}
          refreshing={isFetching}
          renderItem={({item}: any) => (
            <Contain>
              <ViewText>
                <ButtonContain onPress={() => onConcl({order: item})}>
                  <Text>Pedido: {item?.order_number}</Text>
                  <SubText>{item?.statusText}</SubText>
                  <SubText>
                    Data: {formatDateLocal(item?.createdAt, 'DD/MM HH:mm')}
                  </SubText>
                </ButtonContain>
              </ViewText>
              <Border />

              <ButtonContain onPress={() => onConcl({order: item})}>
                <SubTextRow>Visualizar</SubTextRow>
              </ButtonContain>
            </Contain>
          )}
          ListEmptyComponent={() => (
            <NoResultsView>
              <NoResultsMessage>Sem pedidos concluídos</NoResultsMessage>
            </NoResultsView>
          )}
        />
      ) : null}
    </>
  );
};

export default Concluded;
