/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

import {
  ContainerList,
  Contain,
  Text,
  SubText,
  SubTextRow,
  ViewText,
  Border,
  ButtonContain,
  NoResultsView,
  NoResultsMessage,
} from './styles';

const New: React.FC<any> = ({
  order,
  isFetching,
  onRefresh,
  show,
  list,
}: any) => {
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
                <ButtonContain onPress={() => order({order: item})}>
                  <Text>Pedido: {item.order_number}</Text>
                  <SubText>{item.statusText}</SubText>
                </ButtonContain>
              </ViewText>
              <Border />

              <ButtonContain onPress={() => order({order: item})}>
                <SubTextRow>Visualizar</SubTextRow>
              </ButtonContain>
            </Contain>
          )}
          ListEmptyComponent={() => (
            <NoResultsView>
              <NoResultsMessage>Sem novos pedidos</NoResultsMessage>
            </NoResultsView>
          )}
        />
      ) : null}
    </>
  );
};

export default New;
