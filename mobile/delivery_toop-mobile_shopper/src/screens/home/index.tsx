/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {Container} from './styles';

import CompHome from './home';

/** Components */

const Home = ({navigation}: any) => {
  const [checked, setChecked] = useState(false);

  return (
    <Container>
      {/*     <Header>

        <MenuButton onPress={() => navigation.openDrawer()}>
          <MaterialCommunityIcons name="menu" size={28} color={Colors.PRIMARY} />
        </MenuButton>

      </Header>
 */}
      <FlatList
        data={[{title: 'Title Text', key: 'item1'}]}
        style={{marginBottom: 5, marginTop: 10}}
        renderItem={() => <CompHome />}
      />
    </Container>
  );
};

export default Home;
