import React from 'react';
import { Dimensions } from 'react-native';
import { Shadow } from 'react-native-neomorph-shadows';

const CardWithShadow: React.FC = ({ children }) => {
  const d = Dimensions.get('screen');
  return (
    <Shadow
      useArt
      swapShadows
      style={{
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        backgroundColor: '#fff',
        shadowColor: '#dd3527',
        shadowRadius: 3,
        width: d.width * 0.9,
        height: 110,
        borderRadius: 10,
        marginTop: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 5,
      }}>
      {children}
    </Shadow>
  );
};

export default CardWithShadow;
