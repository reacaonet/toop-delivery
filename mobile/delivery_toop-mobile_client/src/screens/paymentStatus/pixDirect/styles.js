import styled from 'styled-components/native';
import { Colors, Typography } from '../../../styles';

export const Container = styled.View`
  width: 98%;
  height: 98%;
  margin-top: 1%;
  margin-left: 1%;
  border-radius: 15px;
  /* border-top-width: 0.3px; */
  /* border-top-color: ${Colors.GREY_LIGHT}; */
  background-color: ${Colors.BLUE_LIGHT_CART};
  justify-content: center;
  align-items: center;
  elevation: 3;
`;

export const KeyContainer = styled.TouchableOpacity`
  margin: 10px;
  width: 80%;
  justify-content: center;
  align-items: center;
  border: 1px dashed;
  border-color: ${Colors.GRAY_MEDIUM};
  border-radius: 5px;
  flex-direction: row;
`;

export const KeyTitle = styled.Text`
  flex: 1;
  color: ${Colors.GRAY_DARK};
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
  margin-right: 5px;
`;

export const PaymentProofContainer = styled.View`
  margin: 10px;
  width: 80%;
  justify-content: center;
  align-items: center;
  border-color: ${Colors.GRAY_MEDIUM};
  border-radius: 5px;
`;

export const PaymentProofTitle = styled.Text`
  color: ${Colors.GRAY_DARK};
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
  margin-right: 5px;
`;

export const PaymentProofValue = styled(PaymentProofTitle)`
  font-size: 18px;
  color: ${Colors.BLACK};
`;

export const AwaitingPayment = styled.View``;

export const AwaitingPaymentTxt = styled.Text`
  color: ${Colors.GRAY_MAX_DARK};
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 7px;
`;

export const IconContent = styled.View`
  margin: 5px;
`;

export const ContentMessage = styled.View`
  margin: 10px;
  width: 80%;
`;

export const Message = styled.Text`
  text-align: center;
  color: ${Colors.GRAY_DARK};
  font-size: 12px;
`;

export const ButtonCopy = styled.TouchableOpacity`
  width: 80%;
  padding: 5px;
  background-color: ${Colors.PRIMARY};
  justify-content: center;
  align-items: center;
  elevation: 3;
`;

export const BtnMethod = styled.TouchableOpacity`
  width: 80%;
  padding: 5px;
  background-color: ${props => props.primary ? Colors.PRIMARY : Colors.GRAY_MEDIUM};
  justify-content: center;
  align-items: center;
  elevation: 3;
  margin-top: 10px;
`;

export const ButtonCopyTxt = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${Colors.WHITE};
`;

export const CopySuccess = styled.View`
  width: 80%;
  border-radius: 5px;
  elevation: 3;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background-color: ${Colors.SUCCESS};
`;

export const CopySuccessTxt = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${Colors.WHITE};
`;
