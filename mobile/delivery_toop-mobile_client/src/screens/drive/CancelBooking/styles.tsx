import { Dimensions, StyleSheet, StatusBar } from 'react-native';
import { Colors, Typography } from '../../../styles';
import styled from 'styled-components/native';

export const styles = StyleSheet.create({
  modalStyle: {
    backgroundColor: 'transparent',
    elevation: 0,
    zIndex: 9999,
  },
  modalChildrenStyle: {
    backgroundColor: Colors.WHITE_HIGHT,
    marginVertical: 20,
    borderRadius: 15,
    zIndex: 999,
    elevation: 3,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: Colors.GRAY_LIGHT,
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
  flatStyle: {
    width: Dimensions.get('window').width - 40,
    marginTop: 20,
    backgroundColor: Colors.WHITE,
  },
});

export const Container = styled.View`
  margin-top: ${(StatusBar.currentHeight || 20) + 15}px;
  width: 100%;
  height: 100%;
  /* justify-content: center; */
  align-items: center;
  z-index: 999;
  background-color: white;
`;

export const Header = styled.View`
  flex-direction: row;
  background-color: ${Colors.WHITE};
  align-items: center;
  margin-top: 5px;
  margin-bottom: 15px;
  margin-left: 20px;
  margin-right: 0px;
  width: 100%;
`;

export const HeaderTitle = styled.Text`
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_BOLD};
  color: ${Colors.PRIMARY};
`;

export const HeaderViewIcon = styled.TouchableOpacity`
  width: 50px;
  height: 50px;
`;

export const Title = styled.Text`
  font-size: ${Typography.FONT_SIZE_17 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.PRIMARY};
  margin-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
`;

export const FlatContent = styled.TouchableOpacity`
  justify-content: center;
  padding: 20px 10px;
  border-bottom-width: 0.5px;
`;

export const Reason = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
`;

export const ContentMocalCancel = styled.View`
  flex: 1;
  margin-top: 20px;
`;

export const BtnContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;

export const BtnNotCancel = styled.TouchableOpacity`
  width: 48%;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.ALERT};
  padding: 10px;
`;

export const BtnCancel = styled.TouchableOpacity`
  width: 48%;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.BLACK};
  padding: 10px;
`;

export const TitleBtn = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.WHITE};
`;
