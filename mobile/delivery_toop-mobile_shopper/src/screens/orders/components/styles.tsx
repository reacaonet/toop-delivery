import styled from 'styled-components/native';

import { Colors } from '../../../styles';

export const ContainerList = styled.FlatList`
  width: 90%;
  height: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;
export const ContainerProgress = styled.View`
  width: 90%;
  flex: 1;
  height: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;
export const Contain = styled.View`
  flex-direction: row;
  width: 100%;
  min-height: 80px;
  justify-content: space-between;
  border-color: ${Colors.GRAY};
  border-width: 1px;
  border-radius: 8px;
  align-self: center;
  margin-top: 10px;
`;
export const Divider = styled.View`
  margin-top: 50px;
`;

export const Text = styled.Text`
  font-size: 16px;
  color: ${Colors.GRAY_MAX_DARK};
`;

export const SubText = styled.Text`
  font-size: 16px;
  color: ${Colors.GRAY};
`;

export const Subtitle = styled.Text`
  font-size: 16px;
  color: ${Colors.PRIMARY};
`;

export const SubTextRow = styled.Text`
  font-size: 13px;
  color: ${Colors.GRAY};
  /* background-color: orange; */
  font-weight: bold;
  text-align: center;
  margin-right: 10px;
`;

export const Border = styled.View`
  border-left-color: ${Colors.GRAY};
  border-left-width: 1px;
  width: 0%;
`;
export const ViewText = styled.View`
  flex-direction: column;
  margin-left: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
  width: 70%;
`;

export const ButtonContain = styled.TouchableOpacity`
  margin-right: ${(props: any) => (props.mgRigh ? `${props.mgRigh}px` : '0px')};
  margin-left: ${(props: any) => (props.mgLeft ? `${props.mgLeft}px` : '0px')};
  justify-content: center;
  flex: 1;
`;

export const View = styled.View`
  width: 100%;
  height: 100%;
`;

export const NoResultsView = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

export const NoResultsMessage = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${Colors.PRIMARY};
`;


