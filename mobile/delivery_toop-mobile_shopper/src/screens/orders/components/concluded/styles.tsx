import styled from 'styled-components/native';

import {Colors} from '../../../../styles'
import { TouchableOpacity } from 'react-native';


export const Container = styled.View`
    width: 100%;
    height: 100%;
    background-color: ${Colors.WHITE};
    align-self: center;
`;

export const ContainerModal = styled.View`
    width: 100%;
    height: 100%
    background-color: ${Colors.WHITE};
    align-self: center;
`;

export const Contain = styled.View`
    width: 90%;
    height: 60px;
    align-self: center;
    background-color: ${Colors.GRAY_LIGHT};
    border-radius: 40px;
    flex-direction: row;
    justify-content: space-between;
`
export const AvatarContain = styled.View`
    flex-direction: row;
`

export const Avatar = styled.Image`
    border-radius: 40px;
    margin-left: 5px;
    margin-top: 5px;
    height: 55px;
    width: 55px;
`

export const TextContain = styled.View`
    flex-direction: column;
`
export const Text = styled.Text`
    font-size: 16px;
    font-weight: bold;
    margin-left: 5px;
    margin-top: 10px;
    color: ${Colors.GRAY_DARK}
`
export const SubText = styled.Text`
    font-size: 18px;
    font-weight: bold;
    margin-left: 5px;
    color: ${Colors.PRIMARY}
`

export const Image = styled.Image`
    width: 100%;
    margin-top: 20px;
    height: 50px
`
export const SubContain = styled.View`
    flex-direction: row;
    justify-content: space-between
`
export const TextSubContain = styled.Text`
    font-size: 16px;
    text-transform: uppercase;
    margin-left: 30px;
    margin-right: 10px;
    color: ${Colors.PRIMARY}
`


export const ImageMessage = styled.Image`
    width: 24px
    height: 24px
    margin-right: 20px;
    margin-top: 20px;
`
export const DetailsView = styled.View`
    width: 100%
    flex-direction: column
    margin-left: 20px;
    margin-top: 30px;
`
export const Number = styled.Text`
    font-size: 16px;
    margin-left: 10px;
    margin-right: 10px;
    color: ${Colors.BLACK}
`
export const TextData = styled.Text`
    font-size: 16px;
    margin-left: 10px;
    margin-right: 10px;
    color: ${Colors.GRAY}
`
export const Status = styled.Text`
    font-size: 16px;
    margin-left: 10px;
    text-transform: uppercase;
    margin-right: 10px;
    color: ${Colors.PRIMARY}
`

export const Total = styled.View`
    width: 100%
    flex-direction: row
    margin-left: 20px
    margin-top: 30px
`

export const Credit = styled.View`
    width: 100%
    flex-direction: row
    justify-content: space-between
    margin-left: 20px
    margin-top: 30px
`

export const ViewAddress = styled.View`
    width: 100%
    margin-top: 40px;
    flex-direction: column
    margin-left: 20px
`

export const House = styled.Text`
    font-size: 18px;
    font-weight: bold;
    margin-left: 10px;
    margin-top: 10px;
    color: ${Colors.PRIMARY}
`

export const Touch = styled.TouchableOpacity`

`
export const TextTouch = styled.Text`
    font-size: 18px;
    text-align: center;
    margin-top: 15px;
    color: ${Colors.WHITE}
`
export const Footer = styled.View`
    flex-direction: row
    justify-content: space-between
    width: 100%
`

export const ImageContain = styled.Image`
    width: 30px
    height: 30px;
    margin-right: 40px;
`
export const TouchMsg = styled.TouchableOpacity`
`