import React from 'react';
import {useSelector} from 'react-redux';
import {
  Header,
  TextHeader,
  TouchBody,
  TextBody,
  Line,
  RadioButton,
  ViewTextBody,
  ViewWithdrawalText,
} from './Styles';
import {formatMoney} from '../../../../../utils';

const TypeSchedule = ({
  company,
  typeSchedule,
  setTypeSchedule,
  deliveryPrice,
  setModal,
  withdrawMarket,
  outsideCoverageArea,
  showSchedule,
}) => {
  const {configurations = null} = useSelector(state => state);

  if (!withdrawMarket) {
    return null;
  }

  const selectedWithdrawal = () => {
    if (typeSchedule === 'WITHDRAWAL') {
      return;
    }

    setModal(true);
    setTypeSchedule('WITHDRAWAL');
  };

  return (
    <>
      <Header>
        <TextHeader>
          {company?.companyCategory === 'service'
            ? 'Visita do Prestador ou Marcar no Local '
            : 'Delivery ou retirada?'}
        </TextHeader>
      </Header>
      <TouchBody onPress={() => selectedWithdrawal()}>
        <ViewTextBody>
          <ViewWithdrawalText outsideCoverageArea={outsideCoverageArea}>
            <TextBody>
              {company?.companyCategory === 'service'
                ? 'Marcar no Local - '
                : showSchedule
                ? 'Agendar retirada - '
                : 'Fazer retirada - '}
            </TextBody>
            <TextBody free={true}>Grátis</TextBody>
          </ViewWithdrawalText>
          {outsideCoverageArea && (
            <TextBody>
              Você esta fora da área de entrega desse estabelecimento,
              disponível somente opção para retirar no local.
            </TextBody>
          )}
        </ViewTextBody>
        <RadioButton selected={typeSchedule === 'WITHDRAWAL'} />
      </TouchBody>
      <Line />
      {!outsideCoverageArea && (
        <TouchBody onPress={() => setTypeSchedule('DELIVERY')}>
          <ViewTextBody>
            <TextBody>
              {company?.companyCategory === 'service'
                ? 'Visita do Prestador - Frete '
                : showSchedule
                ? 'Agendar entrega - Frete '
                : 'Aguardar a entrega - Frete '}
              {formatMoney(deliveryPrice, configurations?.coin)}
            </TextBody>
          </ViewTextBody>
          <RadioButton selected={typeSchedule === 'DELIVERY'} />
        </TouchBody>
      )}
    </>
  );
};

export default TypeSchedule;
