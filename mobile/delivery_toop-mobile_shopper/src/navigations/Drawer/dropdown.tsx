import {Colors} from '../../styles';
import React, {useState} from 'react';
import {SafeAreaView, Text, StyleSheet, Image, View} from 'react-native';
import {ReactReduxContext, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import {updateSelectedCompany} from '../../services/provider/user/';

import Dropdown from './../../components/shared/Dropdown';

import {iOptions} from '../../@types/Dropdown';

function Drop() {
  // const navigation = useNavigation();
  const dispatch = useDispatch();
  const {store} = React.useContext(ReactReduxContext);
  const user = store.getState()?.authUser;

  const [companies, setCompanies] = useState<iOptions[]>([]);
  const [company, setCompany] = useState<iOptions>();

  const handleChangeCompany = (value: iOptions) => {
    setCompany((oldValue) => {
      user.user.company = {
        _id: value.value,
        name: value.label,
        more: value.more,
      };

      dispatch({type: 'SET_USER_SAGA', payload: user});
      updateSelectedCompany(user?.user?._id ?? '', value.value);

      return value;
    });
  };

  React.useEffect(() => {
    if (store.getState()?.authUser?.user?.companies) {
      setCompanies(
        store.getState()?.authUser?.user?.companies?.map((i: any) => ({
          value: i._id,
          label: i.name,
          more: i,
        })),
      );
    }
    if (store.getState()?.authUser?.user?.company?._id) {
      setCompany({
        value: store.getState()?.authUser?.user?.company?._id,
        label: store.getState()?.authUser?.user?.company?.name,
      });
    }
  }, [store.getState()?.authUser?.user]);

  return (
    <SafeAreaView style={styles.safeContainerStyle}>
      <Dropdown
        options={companies}
        onChangeText={handleChangeCompany}
        value={company?.label}
        showLabel={false}
        search={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    color: Colors.WHITE,
    fontSize: 14,
    marginBottom: 5,
  },
  safeContainerStyle: {
    width: '100%',
    justifyContent: 'center',
    marginTop: -35,
  },
});

export default Drop;
