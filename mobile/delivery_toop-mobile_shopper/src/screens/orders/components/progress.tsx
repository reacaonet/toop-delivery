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
  Subtitle,
  ButtonContain,
  NoResultsView,
  NoResultsMessage,
} from './styles';

const Progress: React.FC<any> = ({
  onPress,
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
                <ButtonContain onPress={() => onPress({order: item})}>
                  <Text>Pedido: {item.order_number}</Text>
                  {/* <SubText>{item.statusText}</SubText> */}
                  <Subtitle>{item.statusText}</Subtitle>
                </ButtonContain>
              </ViewText>
              <Border />

              <ButtonContain mgLeft={10} onPress={() => onPress({order: item})}>
                <SubTextRow>Visualizar</SubTextRow>
              </ButtonContain>
            </Contain>
          )}
          ListEmptyComponent={() => (
            <NoResultsView>
              <NoResultsMessage>Sem pedidos em andamento</NoResultsMessage>
            </NoResultsView>
          )}
        />
      ) : null}
    </>
  );
};

export default Progress;
