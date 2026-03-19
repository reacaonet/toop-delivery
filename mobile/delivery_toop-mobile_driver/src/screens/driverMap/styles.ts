import styled from 'styled-components/native';
import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography } from '../../styles';
const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: StatusBar.currentHeight,
  },
  map: {
    flex: 1,
  },
  modalStyle: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    overflow: 'hidden',
    zIndex: 9,
    elevation: 7,
    height: '100%',
  },
  modalOverlayStyle: {
    backgroundColor: 'transparent',
  },
  modalStyleDestiny: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    overflow: 'hidden',
    elevation: 7,
    height: '100%',
    zIndex: 999,
  },
  modalStyleOverlayDestiny: {
    backgroundColor: 'transparent',
  },
  modalStyleDestin: {
    backgroundColor: Colors.WHITE,
    alignItems: 'flex-start',
    flexDirection: 'column',
    marginTop: 20,
  },
  modalDestiny: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 50,
    overflow: 'hidden',
    zIndex: 9,
    elevation: 7,
    height: '100%',
  },
  modalDestinyOverlayStyle: {
    backgroundColor: 'transparent',
  },
  imageDestiny: {
    height: 30,
    width: 30,
  },
  imgDestinyIcon: {
    height: 25,
    width: 25,
  },
  modalStyleService: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    overflow: 'hidden',
    zIndex: 9,
    elevation: 7,
    height: '100%',
  },
  modalStyleOverService: {
    backgroundColor: 'transparent',
  },
});

export const ContainerModal = styled.View`
  height: ${height - 47}px;
  width: 100%;
  z-index: 2;
  elevation: 10;
`;

export const Header = styled.TouchableOpacity`
  width: 100%;
  height: 59px;
  background-color: ${Colors.GREY_BACKGROUND};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 22px;
`;

export const TitleHeader = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 18px;
  color: ${Colors.BLACK};
`;

export const ContentRice = styled.ScrollView`
  flex: 1;
  padding: 0px 20px;
`;

export const DestinyCard = styled.TouchableOpacity`
  width: 100%;
  opacity: 0.4;
  height: 105px;
  border-radius: 7px;
  background-color: ${Colors.GREY_BACKGROUND};
  margin-top: 11px;
  padding: 15px;
`;

export const CompassCard = styled.TouchableOpacity`
  width: 80%;
  height: 105px;
  border-radius: 7px;
  background-color: ${Colors.GREY_BACKGROUND};
  margin-top: 11px;
  padding: 15px;
`;

export const BoxTitleCard = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TitleCard = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 15px;
  margin-left: 12px;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 18px;
  margin-top: 10px;
  color: ${Colors.PRIMARY};
`;

export const Description = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: 15px;
  color: ${Colors.GRAY_TEXT};
  margin-top: 10px;
  margin-bottom: 12px;
  text-align: center;
`;

export const ButtonBox = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-color: ${Colors.GRAY_MEDIUM};
  padding: 18px 0px;
  width: 84%;
`;

export const IconTouchable = styled.TouchableOpacity`
  height: 20px;
  width: 20px;
  border-radius: 50px;
  border-width: 1px;
  border-color: ${Colors.GRAY_MEDIUM};
  background-color: ${Colors.WHITE};
`;

export const ButtonDescription = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: 14px;
  color: ${Colors.GRAY_TEXT};
  margin-left: 12px;
`;

export const ConfirmButton = styled.TouchableOpacity`
  height: 83px;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
`;

export const NotDestinationContent = styled.View`
  height: ${Dimensions.get('window').height * 0.7 + 'px'};
  justify-content: center;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const NotDestinationText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: ${Typography.FONT_SIZE_16 + 'px'};
  color: ${Colors.BLACK};
`;

export const ServiceContent = styled.FlatList`
  width: ${Dimensions.get('window').width + 'px'};
  max-height: 140px;
  background-color: ${Colors.WHITE};
  margin-left: 20px;
`;

export const ServiceItem = styled.TouchableOpacity<{
  selected?: boolean;
}>`
  background-color: ${(props: any) =>
    props.selected ? Colors.GRAY_LIGHT : Colors.WHITE};
  padding: 20px;
  border-radius: 8px;
  margin-left: 5px;
`;

export const ServiceImage = styled.Image`
  width: 65px;
  height: 65px;
`;

export const ServiceTitle = styled.Text<{
  selected?: boolean;
}>`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  color: ${(props: any) => (props.selected ? Colors.PRIMARY : Colors.BLACK)};
  font-size: 15px;
`;

export default styles;
