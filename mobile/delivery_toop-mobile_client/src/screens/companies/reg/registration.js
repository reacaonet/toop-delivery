import React from 'react';
import { FlatList } from 'react-native';

import Empresas from './index'
import{ ContainIndex }from '../styles'

const Cadastro = () => {
  return (
    <ContainIndex>

        <FlatList 
            data={[{ title: 'Title Text', key: 'item1' }]}
            renderItem={() => (
                <Empresas/>  
            )}
        />

    </ContainIndex>
  
    
  );
}

export default Cadastro;