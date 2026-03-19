import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import { Typography, Colors } from '../../../../../styles';

export const styles = StyleSheet.create({
  rideSelected: {
    backgroundColor: '#F0F4F7',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  imageContainer: {
    overflow: 'hidden',
  },
  image: {
    width: 60,
    height: 60,
  },
  rideTitleAndduration: {
    flex: 1,
    marginHorizontal: 20,
  },
  title: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: 16,
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
  },
  price: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.BLACK,
  },
  priceOld: {
    textDecorationStyle: 'solid',
    textDecorationLine: 'line-through',
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.ALERT,
  },
  infoIcon: {
    marginLeft: 5,
  },
});

export const PriceContainer = styled.View`
  flex-direction: column;
`;
