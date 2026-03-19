import { Dimensions, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { Colors, Typography } from '../../styles';

export const styles = StyleSheet.create({
  modalStyle: {
    backgroundColor: 'transparent',
    marginTop: Dimensions.get('window').height * 0.18,
    marginLeft: 15,
    marginRight: 15,
    elevation: 0,
    zIndex: 999,
  },
  modalChildrenStyle: {
    width: '100%',
    maxHeight: 330,
    backgroundColor: Colors.WHITE,
    borderRadius: 7,
    elevation: 2,
    zIndex: 999,
  },
  modalOverlay: {
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  progressBar: {
    width: '95%',
    marginTop: 10,
    color: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
    borderWidth: 0,
    borderRadius: 10,
    // position: 'absolute',
    bottom: 0,
  },
  animatedStyle: {
    width: 20,
    height: 20,
  },
});

export const Container = styled.View`
  width: 100%;
  height: 100%;
  /* justify-content: center; */
  align-items: center;
  z-index: 999;
`;

export const Title = styled.Text`
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.PRIMARY};
  padding-left: 10px;
  padding-right: 10px;
`;

export const ContentInfo = styled.View`
  width: 100%;
  margin: 10px;
  padding-left: 10px;
  padding-right: 10px;
  flex-direction: row;
  justify-content: space-between;
`;

export const PriceTxt = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_16 + 'px'};
`;

export const KMTxt = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.PRIMARY};
  font-size: ${Typography.FONT_SIZE_13 + 'px'};
`;

export const DistanceTxt = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.GRAY_TEXT};
  font-size: ${Typography.FONT_SIZE_12 + 'px'};
`;

export const Options = styled.View`
  width: 100%;
  /* position: absolute; */
  justify-content: space-between;
  flex-direction: row;
  /* bottom: 20px; */
  padding-left: 10px;
  padding-right: 10px;
`;

export const AcceptBtn = styled.TouchableOpacity`
  width: 48%;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: ${Colors.PRIMARY};
  border-radius: 7px;
  justify-content: center;
  align-items: center;
`;

export const TitleAccept = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_16 + 'px'};
  color: ${Colors.WHITE};
`;

export const RefuseBtn = styled.TouchableOpacity`
  width: 48%;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: ${Colors.PRIMARY};
  border-radius: 7px;
  justify-content: center;
  align-items: center;
`;

export const TitleRefuse = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_16 + 'px'};
  color: ${Colors.WHITE};
`;

export const ContainerAddress = styled.View`
  width: 90%;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  /* background-color: orange; */
  margin-bottom: 10px;
`;

export const ContainerIconAddress = styled.View``;
export const ContainderTextAddress = styled.View`
  flex: 1;
`;

export const TextAdressUp = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.GRAY_TEXT};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  margin-left: 10px;
`;

export const Triangle = styled.View`
  margin-left: 10px;
  margin-top: 10px;
  background-color: transparent;
  border-style: solid;
  width: 0;
  height: 0;
  border-top-width: 0px;
  border-right-width: 5px;
  border-bottom-color: ${Colors.BLACK};
  border-bottom-width: 10px;
  border-left-width: 5px;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: ${Colors.BLACK};
  border-left-color: transparent;
  transform: rotate(180deg);
`;

export const Line = styled.View`
  height: 20px;
  width: 1px;
  margin-left: 13px;
  margin-top: -15px;
  background-color: ${Colors.GRAY_MAX_DARK};
`;

export const Circle = styled.View`
  margin-left: 10px;
  margin-top: 10px;
  height: 8px;
  width: 8px;
  border-radius: 4px;
  background-color: ${Colors.PRIMARY};
`;

export const ContainerPassenger = styled.View`
  width: 90%;
  flex-direction: row;
  margin-bottom: 10px;
`;

export const PassengerPhoto = styled.Image`
  width: 50px;
  height: 50px;
  background-color: ${Colors.GRAY};
`;

export const PassengerInfo = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
  margin-left: 10px;
  justify-content: center;
`;

export const PassengerName = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  color: ${Colors.PRIMARY};
`;

export const PassengerTextAdditional = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_12 + 'px'};
  color: ${Colors.GRAY_MAX_DARK};
`;

export const PipContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.1);
  justify-content: center;
  align-items: center;
`;

export const ImageContainer = styled.View`
  height: 100px;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border-radius: 100px;
  padding: 0px 5px;
`;

export const PipText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.GRAY};
`;

export const ImageLogo = styled.Image`
  width: 90px;
  height: 90px;
`;
