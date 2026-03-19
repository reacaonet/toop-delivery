import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography } from '../../styles';

export const styles = StyleSheet.create({
  scrollStyle: {
    flexDirection: 'column',
    marginTop: 45,
    backgroundColor: Colors.PRIMARY,
  },
});

export const Container = styled(LinearGradient)`
  flex: 1;
  opacity: 0.9;
  background: ${Colors.BLACK};
  width: 100%;
`;

export const DrawerHeaderWrapper = styled.View`
  background: ${Colors.PRIMARY};
  height: 100px;
  flex-direction: row;
`;

export const DrawerHeaderAvatar = styled.Image`
  width: 65px;
  height: 65px;
  border-radius: 45px;
  margin-top: 60px;
  margin-left: 20px;
`;

export const AvatarName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  text-align: right;
  color: #fff;
`;

export const AvatarInfo = styled.Text`
  font-size: 13px;
  font-weight: bold;
  text-align: right;
  color: #6e6f71;
`;

export const AvatarPlaca = styled.Text`
  font-size: 13px;
  font-weight: bold;
  text-align: right;
  color: #6e6f71;
`;

export const AvatarLocation = styled.Text`
  color: #6e6f71;
  margin-top: 10px;
  margin-left: 3px;
  font-weight: 400;
  font-size: 12px;
`;

export const DrawerHeaderTextWrapper = styled.View`
  margin-top: 65px;
  margin-right: 10px;
  width: 175px;
  text-align: left;
  background: ${Colors.PRIMARY};
`;

export const Divider = styled.View`
  border-bottom-width: 1px;
  width: 86%;
  align-self: center;
  border-bottom-color: rgba(0, 0, 0, 0.1);
`;

export const DrawerButtons = styled.View`
  margin-top: 50px;
  width: 175px;
  height: 100%;
  text-align: left;
`;

export const MenuCategory = styled.Text`
  color: #fff;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  padding-top: -20px;
  margin-left: 20px;
`;

export const Viewer = styled.View`
  flex-direction: row;
  margin-top: 15px;
  height: 35px;
`;

export const TextVersion = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_15}px;
  margin-top: 190px;
  color: ${Colors.WHITE};
  background-color: ${Colors.BLACK};
  text-align: center;
`;
