/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {Text} from 'react-native';
import {TextInputMask} from 'react-native-masked-text';
import {useTranslation} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import SelectDropdown from 'react-native-select-dropdown';

/** Services */
import {isAuthenticated} from '../../../../services/userAuth';
import {listContries} from '../../../../services/provider/settings/contries';

import {styles, ViewBody, TextInput, ViewInput, Input} from './Styles';

const PersonData = ({
  setName,
  name,
  setEmail,
  email,
  setPhone,
  ddi,
  setDdi,
  phone,
  setPerson,
  setSku,
  setPicture,
  currentCountrie,
  setCurrentCountrie,
}) => {
  const {t} = useTranslation();
  const selectRef = useRef(null);
  const [countries, setCountries] = useState(null);

  useEffect(() => {
    const getUsers = async () => {
      const {user: userAuth} = await isAuthenticated();
      setPerson(userAuth.person._id);
      setSku(userAuth.sku);

      if (userAuth.person.name) {
        setName(userAuth.person.name);
      }

      if (userAuth.person.email) {
        setEmail(userAuth.person.email);
      }

      if (userAuth.person.image) {
        setPicture(userAuth.person.image);
      }

      if (userAuth.person.ddi) {
        setDdi(`${userAuth.person.ddi}`.trim());
      }

      if (userAuth.person.phone) {
        let phoneString = '';
        let phoneEdit = '';

        if (userAuth.person.ddi) {
          phoneString = userAuth.person.phone.toString();
          phoneEdit = `${phoneString}`.replace(
            `${userAuth.person.ddi}`.replace('+', ''),
            '',
          );
        } else {
          phoneString = userAuth.person.phone.toString();
          phoneEdit = phoneString.substring(2, phoneString.length);
        }

        setPhone(phoneEdit);
      }

      const languages = RNLocalize.getLocales();

      if (languages && Array.isArray(languages) && languages.length > 0) {
        listContries({
          language: languages[0].languageTag,
        }).then(result => {
          if (result && Array.isArray(result) && result.length > 0) {
            setCountries(result);
            if (userAuth?.person?.ddi) {
              result.map(item => {
                if (
                  `${item?.value}` === `${userAuth?.person?.ddi}` &&
                  item?.mask
                ) {
                  setCurrentCountrie(item);
                  setDdi(item.value);
                }
              });
            } else if (result[0].mask) {
              setCurrentCountrie(result[0]);
            }
          } else {
            setCountries(null);
          }
        });
      }
    };

    getUsers();
  }, []);

  return (
    <ViewBody>
      <TextInput>Nome completo</TextInput>
      <ViewInput>
        <Input
          value={name}
          onChangeText={setName}
          autoFocus={true}
          autoCompleteType={'name'}
          returnKeyType={'next'}
        />
      </ViewInput>
      <TextInput>Email</TextInput>
      <ViewInput>
        <Input
          value={email}
          onChangeText={setEmail}
          autoCompleteType={'email'}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          keyboardType={'email-address'}
        />
      </ViewInput>
      <TextInput>{t('editUser.phoneTitle')}</TextInput>
      <ViewInput style={styles.boxPhone}>
        {countries ? (
          <SelectDropdown
            ref={selectRef}
            buttonStyle={styles.buttonStyle}
            rowTextStyle={styles.rowTextStyle}
            buttonTextStyle={styles.buttonTextStyle}
            data={countries}
            defaultButtonText={currentCountrie?.name || 'Selecione'}
            defaultValue={ddi}
            onSelect={selectedItem => {
              setDdi(selectedItem.value);
              setCurrentCountrie(selectedItem);
              setPhone('');
            }}
            buttonTextAfterSelection={selectedItem => {
              return (
                <>
                  <Text style={styles.txtPhone}>{selectedItem.name}</Text>
                </>
              );
            }}
            rowTextForSelection={(item, _index) => {
              return <Text style={styles.txtPhone}>{item.name}</Text>;
            }}
            dropdownIconPosition="right"
          />
        ) : null}
        {countries ? (
          <TextInputMask
            type={'custom'}
            value={phone}
            onChangeText={value => setPhone(value)}
            style={styles.inputPhone}
            placeholder={t('login.placeholder')}
            placeholderTextColor="#999a99"
            keyboardType="phone-pad"
            options={{
              mask:
                currentCountrie && currentCountrie?.mask
                  ? `${currentCountrie?.mask}`
                  : '(99) 99999-9999',
            }}
          />
        ) : null}
      </ViewInput>
    </ViewBody>
  );
};

export default PersonData;
