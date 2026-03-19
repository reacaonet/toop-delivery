import styled from 'styled-components/native';
import {Colors} from '../../styles';

export const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 25,
    background: Colors.WHITE,
    marginLeft: 40,
    marginRight: 40,
  },
})`
  background: ${Colors.BACKGROUND};
`;

export const SafeAreaView = styled.SafeAreaView`
  flex: 1;
  background: ${Colors.BACKGROUND};
`;

export const CustomHeader = styled.View`
  background: ${Colors.BACKGROUND};
  height: 150px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

export const HeaderTitle = styled.Text`
  color: ${Colors.GREY};
  font-size: 20px;
  line-height: 35px;
  margin-bottom: 20px;
`;

export const ViewText = styled.Text`
  color: ${Colors.PRIMARY};
  font-size: 18px;
  margin-bottom: 25px;
  line-height: 28px;
`;

export const ButtonWrapper = styled.View`
  width: 80%;
  margin-top: 20px;
  margin-bottom: 10px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

export const ViewBox = styled.View``;

export const ViewButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ButtonDocument = styled.TouchableOpacity`
  background-color: ${Colors.PRIMARY};
  align-items: center;
  min-height: 50px;
  justify-content: center;
  border-radius: 20px;
  width: 170px;
  margin-right: 5px;
`;

export const TextButtonDocument = styled.Text`
  color: ${Colors.WHITE};
  font-size: 16;
  font-weight: bold;
`;
