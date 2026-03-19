import styled from 'styled-components/native';
import {StyleSheet} from 'react-native';

import {Colors} from '../../../../styles';

export const styles = StyleSheet.create({
  flatStyle: {
    marginBottom: 5,
    marginTop: 10,
  },
});

export const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;

export const ContainerModal = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;

export const Contain = styled.View`
  width: 90%;
  height: 60px;
  align-self: center;
  background-color: ${Colors.GRAY_LIGHT};
  border-radius: 40px;
  flex-direction: row;
  justify-content: space-between;
`;
export const AvatarContain = styled.View`
  flex-direction: row;
`;

export const Avatar = styled.Image`
  border-radius: 40px;
  margin-left: 5px;
  margin-top: 5px;
  height: 55px;
  width: 55px;
`;

export const TextContain = styled.View`
  flex-direction: column;
`;
export const Text = styled.Text`
  font-size: 14px;
  margin-left: 5px;
  margin-top: 10px;
  color: ${Colors.GRAY_DARK};
`;
export const SubText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-left: 5px;
  color: ${Colors.PRIMARY};
`;

export const Image = styled.Image`
  width: 100%;
  margin-top: 20px;
  height: 50px;
`;

export const ImageItem = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 5px;
  background-color: ${Colors.GRAY_LIGHT};
  border: 1px;
  border-style: solid;
  border-width: 1px;
  border-color: ${Colors.GRAY_LIGHT};
`;

export const SubContain = styled.View`
  flex-direction: row;
  justify-content: space-between;

  padding-left: 25px;
  padding-right: 25px;
`;
export const TextSubContain = styled.Text`
  font-size: 16px;
  text-transform: uppercase;
  font-weight: bold;
  color: ${Colors.PRIMARY};
`;

export const TextTotalMessage = styled.Text`
  position: absolute;
  margin-left: 20px;
  top: 5px;
  color: ${Colors.SECONDARY};
  font-weight: bold;
`;

export const ImageMessage = styled.Image`
  width: 24px;
  height: 24px;
  margin-right: 20px;
  margin-top: 20px;
`;

export const DetailsView = styled.View`
  padding-left: 25px;
  padding-right: 25px;
  padding-bottom: 25px;

  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export const LisView = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  padding: 25px;
  padding-bottom: 15px;
  padding-top: 0px;
  margin: 5px;

  border-bottom-width: 1px;
  border-style: dotted;
  border-bottom-color: ${Colors.GRAY_LIGHT};
`;

export const Number = styled.Text`
  font-size: 14px;
  color: ${Colors.BLACK};
  font-weight: bold;
`;

export const AmountText = styled.Text`
  font-size: 14px;
  margin-left: 10px;
  margin-right: 10px;
  color: ${Colors.GREY};
`;

export const PriceText = styled.Text`
  font-size: 12px;
  color: ${Colors.PRIMARY};
`;

export const PriceSmallText = styled.Text`
  font-size: 8px;
  color: ${Colors.PRIMARY};
`;

export const ComplementText = styled.Text`
  font-size: 10px;
  margin-left: 0px;
  margin-right: 0px;
  color: ${Colors.GRAY};
`;

export const ObsText = styled.Text`
  font-size: 12px;
  margin-left: 10px;
  margin-right: 0px;
  font-weight: bold;
  color: ${Colors.GRAY};
`;

export const TextData = styled.Text`
  font-size: 14px;

  color: ${Colors.GRAY};
`;

export const Status = styled.Text`
  font-size: 16px;
  margin-left: 10px;
  text-transform: uppercase;
  margin-right: 10px;
  color: ${Colors.PRIMARY};
`;

export const Total = styled.View`
  padding: 25px;
  flex-direction: column;
`;

export const Credit = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 20px;
  margin-top: 20px;
`;

export const ViewAddress = styled.View`
  padding-left: 25px;
  padding-right: 25px;
  flex-direction: column;
`;

export const House = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
  margin-top: 10px;
  color: ${Colors.PRIMARY};
`;

export const Touch = styled.TouchableOpacity`
  width: 90%;
  padding: 10px 0px;
  align-self: center;
  /* position: absolute; */
  border-radius: 12px;
  /* bottom: 5px; */
  background-color: ${(props: any) =>
    props?.colorDisable ? Colors.GRAY_DARK : Colors.PRIMARY};
  justify-content: center;
  align-items: center;

  margin-top: 5px;
`;

export const TouchCancel = styled.TouchableOpacity`
  width: 70%;
  elevation: 3;
  border-color: ${Colors.BLACK};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  background-color: ${Colors.PRIMARY};

  margin-top: 0px;
  margin-bottom: 5px;

  align-self: center;

  text-align: center;
  justify-content: center;
  align-items: center;

  padding: 7px;
`;

export const TextTouchCancel = styled.Text`
  font-size: 12px;
  color: ${Colors.WHITE};
`;

export const TextTouch = styled.Text`
  font-size: 15px;
  color: ${Colors.WHITE};
`;

export const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const ImageContain = styled.Image`
  width: 30px;
  height: 30px;
`;

export const ContentTabs = styled.View`
  width: 100%;
  height: 60px;
`;

export const TouchMsg = styled.TouchableOpacity``;
