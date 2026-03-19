import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../styles';
import styled from 'styled-components/native';

export const ListItem = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  padding: 0 10px;
`;

export const LeftContent = styled.View`
  flex: 1;
  justify-content: center;
`;

export const AcceptButton = styled.View`
  border-left-width: 2px;
  border-color: #f5f3f4;
  justify-content: center;
  padding-left: 15px;
  padding-right: 5px;
`;

export const AcceptButtonText = styled.Text`
  font-weight: bold;
  color: ${Colors.GREY};
`;

interface ListItemTextProps {
  color?: string;
  size?: number;
}

export const ListItemText = styled.Text<ListItemTextProps>`
  color: ${(props) => (props.color ? props.color : '#c3c3c3')};
  font-size: ${(props) => (props.size ? props.size : 14)}px;
  padding-top: 2px;
`;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 10,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    marginTop: -15,
    paddingTop: 15,
    zIndex: 1,
  },
  tabBarStyle: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: '#e8e6e8',
    elevation: 0,
  },
  tabBarIndicatorStyle: {
    backgroundColor: 'transparent',
  },
  tabBarTabStyle: {
    paddingVertical: 0,
  },
  TabBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  TabBarTitle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  badge: {
    color: '#fff',
    borderRadius: 20,
    width: 20,
    height: 20,
    textAlign: 'center',
    marginLeft: 5,
  },
  boxOrders: {
    flex: 1,
  },
  flatStyle: {
    flex: 1,
  },
  textEmpty: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
  },
  flatContainer: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  contentShadow: {
    paddingVertical: 10,
  },
  txt: {
    fontSize: 14,
    color: Colors.GREY,
  },
  txtCompany: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.BLACK,
    fontSize: 16,
  },
  txtStatus: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.SUCCESS,
  },
});
