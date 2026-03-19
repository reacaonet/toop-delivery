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

export const ContainerHeader = styled.SafeAreaView`
  flex: 1;
  background: ${Colors.BACKGROUND};
  margin-top: 25px;
`;

export const CustomHeader = styled.View`
  margin-top: 5px;
  background: ${Colors.BACKGROUND};
  height: 30px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

export const HeaderTitle = styled.Text`
  color: ${Colors.GREY};
  font-size: 20px;
  line-height: 35px;
  margin-bottom: 10%;
`;

export const ViewText = styled.Text`
  color: ${Colors.GREY};
  font-size: 18px;
  margin-bottom: 25px;
  line-height: 28px;
`;

export const ViewButtonWrapper = styled.View`
  align-items: center;
  justify-content: center;
  width: 80%;
  margin-bottom: 10px;
`;

export const ViewBox = styled.View``;

export const ButtonDocument = styled.TouchableOpacity`
  background-color: ${Colors.PRIMARY};
  align-items: center;
  min-height: 50px;
  justify-content: center;
  border-radius: 20px;
  width: 45%;
  margin-right: 8px;
`;

export const TextButtonDocument = styled.Text`
  color: ${Colors.WHITE};
  font-size: 16;
  font-weight: bold;
`;
