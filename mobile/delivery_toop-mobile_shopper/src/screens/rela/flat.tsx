import React from 'react';
import moment from 'moment';

import {formatMoney} from './../../utils/index';
import {
  Container,
  ContainBox,
  Header,
  SubHeader,
  TitleContainBox,
  SubTitleContainBox,
  Divider,
  ContainList,
  TextList,
  Footer,
  TextFooter1,
  TextFooter2,
} from './styles';

const Flat = ({item}: any) => {
  return (
    <ContainBox>
      <Header>
        <TitleContainBox>{item?._id.date}</TitleContainBox>
        <TitleContainBox>{formatMoney(item?.value ?? 0, true)}</TitleContainBox>
      </Header>

      <SubHeader>
        <SubTitleContainBox>Nº {item?._id.orderNumber}</SubTitleContainBox>
        <SubTitleContainBox>VALOR DO PEDIDO</SubTitleContainBox>
      </SubHeader>
      <Divider />

      <ContainList>
        <TextList>Loja: {item._id.companyName}</TextList>
        <TextList>Status: {getState(item._id.orderStatus)}</TextList>
        <TextList>Pagamento: {getTypePayment(item._id.typePayment)}</TextList>
      </ContainList>
      <Divider />
      <Footer>
        <TextFooter1>
          Repasse:{' '}
          <TextFooter2>
            {formatMoney(item?.passAlongFranchise ?? 0, true)}
          </TextFooter2>
        </TextFooter1>

        <TextFooter1>
          Receber:{' '}
          <TextFooter2>
            {formatMoney(item?.receiveFranchise ?? 0, true)}
          </TextFooter2>
        </TextFooter1>
      </Footer>
    </ContainBox>
  );
};

export default Flat;

function getTypePayment(type: string) {
  switch (type) {
    case 'MONEY':
      return 'Dinheiro';
    case 'CARD':
      return 'Maquininha';
    case 'PIX':
      return 'PIX';
    default:
      return 'APP';
  }
}

function getState(state: string) {
  switch (state) {
    case 'IN_PREPARATION':
      return 'Em preparação';
    case 'CANCELED':
      return 'Cancelado';
    case 'FINISHED':
      return 'Finalizado';
    case 'ACCEPT_SHOPPER':
      return 'Aceito Estabelecimento';
    default:
      return 'Aguardando';
  }
}
