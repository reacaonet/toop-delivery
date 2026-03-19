import {Dimensions, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {Colors, Typography} from '../../../styles';

interface CardProps {
  color?: string;
}

export const styles = StyleSheet.create({
  modalize: {
    flex: 1,
    marginTop: Dimensions.get('window').height * 0.1,
    zIndex: 11,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    width: '100%',
    height: Dimensions.get('window').height - 0.1,
  },
});

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
  height: ${Dimensions.get('window').height - 0.1}px;
  z-index: 11;
`;

export const Header = styled.View`
  flex-direction: row;
  background-color: ${Colors.WHITE};
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 15px;
  margin-left: 20px;
  margin-right: 0px;
`;

export const HeaderTitle = styled.Text`
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_BOLD};
  color: ${Colors.PRIMARY};
  text-transform: uppercase;
`;

export const HeaderViewIcon = styled.TouchableOpacity`
  width: 50px;
  height: 50px;
`;

export const ContentPrice = styled.View`
  /* flex: 1; */
  margin-left: 20px;
`;

export const ServiceNameView = styled.View`
  width: 35%;
  border-radius: 20px;
  background-color: ${Colors.PRIMARY};
  justify-content: center;
  align-items: center;
  padding: 0px;
`;

export const ServiceName = styled.Text`
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.WHITE};
`;

export const PriceDriverContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const PriceDriver = styled.Text`
  font-size: ${Typography.FONT_SIZE_25}px;
  font-family: ${Typography.FONT_FAMILY_BOLD};
  color: ${Colors.BLACK};
`;

export const CurrencySymbol = styled.Text`
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.BLACK};
  margin-right: 5px;
`;

export const Card = styled.View<CardProps>`
  margin-top: 10px;
  padding: 10px 20px;
  background-color: ${(props: any) =>
    props.color ? props.color : Colors.GRADIENTE_GREY_BOX};
`;

export const CardTitle = styled.Text`
  font-size: ${Typography.FONT_SIZE_16}px;
  font-family: ${Typography.FONT_FAMILY_BOLD};
  color: ${Colors.GRAY};
`;

export const DetailView = styled.View`
  flex-grow: 1;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
`;

export const DetailTxt = styled.Text<CardProps>`
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${(props: any) => (props.color ? props.color : Colors.GRAY)};
`;

export const Footer = styled.View`
  flex-direction: row;
  border-color: ${Colors.BLACK};
  justify-content: center;
  align-items: center;
  margin: 20px 15px;
`;

export const FooterTime = styled.View`
  width: ${Dimensions.get('window').width * 0.5}px;
  height: 50px;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
  elevation: 3;
`;

export const FooterTimeTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_15}px;
  color: ${Colors.GRAY};
`;

export const FooterTimeSubTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.GRAY};
`;

export const FooterLine = styled.View`
  width: ${Dimensions.get('window').width * 0.01}px;
  height: 30px;
  width: 1px;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
  /* border-width: 1px;
  border-color: orange; */
`;

export const FooterDistance = styled.View`
  width: ${Dimensions.get('window').width * 0.5}px;
  height: 50px;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
  elevation: 3;
`;

export const FooterDistanceTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.GRAY};
`;

export const FooterDistanceSubTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.GRAY};
`;
