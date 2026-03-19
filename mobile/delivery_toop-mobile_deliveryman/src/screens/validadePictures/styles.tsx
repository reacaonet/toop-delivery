import styled from 'styled-components/native';
import {Colors} from '../../styles';

export const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    justifyContent: 'center',
    flexGrow: 1,
    paddingHorizontal: 25,
    background: Colors.WHITE,
    marginLeft: 10,
    marginRight: 40,
  },
})`
  background: ${Colors.WHITE};
`;

export const SafeAreaView = styled.SafeAreaView`
  flex: 1;
  background: ${Colors.WHITE};
`;

export const CustomHeader = styled.View`
  background: ${Colors.WHITE};
  align-items: flex-start;
  justify-content: center;
  flex-direction: row;
  margin-top: 25px;
`;

export const HeaderTitle = styled.Text`
  color: ${Colors.GREY};
  font-size: 20px;
  line-height: 30px;
`;

export const ViewText = styled.Text`
  color: ${Colors.GREY};
  font-size: 18px;
  margin-bottom: 25px;
  line-height: 28px;
`;

export const ButtonWrapper = styled.View`
  align-items: center;
  justify-content: center;
  width: 80%;
  margin-bottom: 10px;
`;

export const ImageSelfie = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 100%;
  height: 100%;
  border-radius: 27px;
`;

export const ViewImage = styled.View`
  color: ${Colors.WHITE};
  border: 2px;
  border-color: ${Colors.DARK_LIGHT};
  border-radius: 10px;
  width: 114px;
  height: 150px;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
`;

export const ViewBoxImages = styled.View`
  flex-direction: row;
  background: ${Colors.WHITE};
  align-items: center;
  flex-shrink: 1;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const ViewBox = styled.View`
  margin-top: 20px;
`;

export const ScrollViewImages = styled.ScrollView.attrs({
  horizontal: true,
})`
  flex: 1;
  background: ${Colors.WHITE};
`;
