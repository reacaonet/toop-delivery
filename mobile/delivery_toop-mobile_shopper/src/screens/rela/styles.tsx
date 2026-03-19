import styled from 'styled-components/native';

import {Colors} from '../../styles';

export const Container = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
`;

export const ContainTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ContainFilter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  padding-top: 20px;
`;

export const Box = styled.View`
  width: 45%;
  height: 80px;
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  border-radius: 8px;
  background-color: ${Colors.BACKGROUND};
`;

export const TitleBox = styled.Text`
  font-size: 19px;
  margin-top: 5px;
  margin-left: 10px;
  text-align: center;
  color: ${Colors.TEXT_INPUT};
`;

export const TitleFilter = styled.Text`
  font-size: 14px;
  padding: 2px;
  text-align: center;
  color: ${Colors.TEXT_INPUT};
  font-weight: bold;
`;

export const TextBox = styled.Text`
  font-size: 18px;
  margin-top: 5px;
  margin-left: 10px;
  text-align: center;
  color: ${Colors.PRIMARY};
`;
export const Image = styled.Image`
  width: 20px;
  height: 20px;
  margin-top: 25px;
  margin-left: 30px;
  position: absolute;
  z-index: 999;
`;
export const ContainInput = styled.View`
  flex-direction: row;
`;

export const TextInput = styled.TextInput`
  width: 90%;
  height: 45px;
  margin-top: 10px;
  margin-left: 20px;
  padding-top: 12px;
  padding-left: 40px;
  padding-bottom: 10px;
  background-color: ${Colors.BACKGROUND};
  border-color: ${Colors.PRIMARY};
  color: ${Colors.TEXT_INPUT};
  border-width: 1px;
  border-radius: 8px;
  border-style: solid;
`;

export const Title = styled.Text`
  font-size: 20px;
  margin-top: 20px;
  margin-left: 20px;
  color: ${Colors.PRIMARY};
`;
export const Contain = styled.View`
  width: 90%;
  height: 40px;
  margin-top: 10px;
  border-radius: 12px;
  align-self: center;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${Colors.BACKGROUND};
`;

export const IconOrd = styled.Image`
  width: 18px;
  height: 18px;
  margin-right: 10px;
  margin-top: 12px;
`;

export const ContainFooter = styled.View`
  width: 100%;
  height: 100px;
  position: absolute;
  bottom: 0;
  background-color: ${Colors.BACKGROUND};
`;

export const ContainBox = styled.View`
  width: 90%;
  margin-top: 20px;
  flex-direction: column;
  background-color: ${Colors.BACKGROUND};
  align-self: center;
  border-radius: 8px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;
export const TitleContainBox = styled.Text`
  font-size: 18px;
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
  color: ${Colors.PRIMARY};
`;
export const SubTitleContainBox = styled.Text`
  font-size: 12px;
  margin-top: 0px;
  margin-left: 20px;
  margin-right: 20px;
  color: ${Colors.GRAY};
`;
export const SubHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;
export const Divider = styled.View`
  border-bottom-color: ${Colors.WHITE};
  border-bottom-width: 2px;
  align-self: center;
  width: 90%;
  margin-top: 15px;
`;
export const ContainList = styled.View`
  flex-direction: column;
  margin-top: 10px;
`;
export const TextList = styled.Text`
  font-size: 14px;
  margin-top: 5px;
  margin-left: 20px;
  margin-right: 20px;
  color: ${Colors.GRAY};
`;
export const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
`;
export const TextFooter1 = styled.Text`
  font-size: 14px;
  margin-left: 20px;
  margin-right: 20px;
  color: ${Colors.GRAY};
`;
export const TextFooter2 = styled.Text`
  font-size: 15px;
  margin-right: 20px;
  color: ${Colors.PRIMARY};
`;
