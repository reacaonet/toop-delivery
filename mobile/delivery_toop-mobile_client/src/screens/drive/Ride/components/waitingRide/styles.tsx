import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../../../styles';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export const styles = StyleSheet.create({
  scrollStyle: {
    alignItems: 'center',
    elevation: 3,
  },
  progressBar: {
    marginLeft: 10,
    marginBottom: 10,
    color: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
    borderWidth: 0,
    borderRadius: 10,
  },
  modalStyles: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
});

export const Container = styled.ScrollView`
  width: 100%;
  padding-top: 10px;
  position: absolute;
  bottom: 0;
  background-color: ${Colors.WHITE};
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
`;

export const TouchConfirm = styled.TouchableOpacity`
  width: 90%;
  padding: 10px;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.WHITE};
  border-radius: 5px;
  elevation: 3;
`;

export const ConfirmTitle = styled.Text`
  color: ${Colors.RED};
  font-weight: bold;
`;

export const Title = styled.Text`
  color: ${Colors.BLACK};
  font-weight: bold;
  font-size: ${Typography.FONT_SIZE_14}px;
  margin-bottom: 10px;
`;

export const TextTime = styled.Text`
  color: ${Colors.BLACK};
  font-weight: bold;
  font-size: ${Typography.FONT_SIZE_14}px;
  margin-bottom: 10px;
`;

export const ContentAddress = styled.View`
  width: 90%;
  margin-bottom: 20px;
`;

export const AddressItem = styled.View`
  flex-direction: row;
  align-items: center;
  width: 90%;
`;

export const MarkerAddress = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: red;
  margin-right: 10px;
`;

export const AddressText = styled.Text`
  width: 95%;
`;

export const DividerAddress = styled.View`
  width: 1px;
  height: 15px;
  background-color: ${Colors.GRAY_DARK};
  margin-left: 4px;
`;

export const ModalizeContainer = styled.View`
  width: 100%;
  margin-top: 10px;
  align-items: center;
`;

export const TextExplicative = styled.Text`
  color: ${Colors.BLACK};
  font-weight: bold;
  font-size: ${Typography.FONT_SIZE_20};
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 20px;
  margin-right: 20px;
  width: 90%;
`;

export const TextExplicative2 = styled.Text`
  color: ${Colors.BLACK};
  font-weight: 600;
  font-size: ${Typography.FONT_SIZE_14}px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 20px;
  margin-right: 20px;
  width: 90%;
`;

export const BtnContainer = styled.View`
  flex-direction: row;
  width: 90%;
  justify-content: space-between;
`;

export const BtnWait = styled.TouchableOpacity`
  width: 48%;
  padding: 10px;
  border-color: ${Colors.GRAY_LIGHT};
  border-width: 1px;
  background-color: ${Colors.WHITE};
  border-radius: 3px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  elevation: 3;
`;

export const TextWait = styled.Text`
  color: ${Colors.GRAY_MAX_DARK};
  font-weight: 600;
  font-size: ${Typography.FONT_SIZE_14}px;
`;

export const BtnCancel = styled.TouchableOpacity`
  width: 48%;
  border-color: ${Colors.GRAY_LIGHT};
  border-radius: 3px;
  align-items: center;
  margin-bottom: 10px;
  elevation: 3;
`;

export const BtnCancelLinear = styled(LinearGradient)`
  flex: 1;
  width: 100%;
  opacity: 0.9;
  padding: 10px;
  border-radius: 3px;
  justify-content: center;
  align-items: center;
`;

export const TextCancel = styled.Text`
  color: ${Colors.WHITE};
  font-weight: 600;
  font-size: ${Typography.FONT_SIZE_14}px;
`;

export const Space = styled.View`
  width: 50px;
  height: 30px;
  background-color: white;
`;
