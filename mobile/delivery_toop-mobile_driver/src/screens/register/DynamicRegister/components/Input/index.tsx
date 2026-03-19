/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/** Styles */
import { Container, Title, SubTitle, TextInput, InputMask } from './styles';
import { Colors } from '../../../../../styles';

const Input = ({ name, placeholder, payload, item }: any) => {
  const [textValue, setTextValue] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (textValue === '') {
        const current = { ...payload.current };
        if (item.inputGroup) {
          if (!current[`${item.inputGroup}`]) {
            current[`${item.inputGroup}`] = {};
          }

          current[`${item.inputGroup}`][`${name}`] = '';
        } else {
          current[`${name}`] = '';
        }

        payload.current = current;
      }
    }, []),
  );

  return (
    <Container>
      {item?.title ? <Title>{item?.title}</Title> : null}

      {item?.subTitle ? <SubTitle>{item?.subTitle}</SubTitle> : null}

      {item?.mask ? (
        <InputMask
          {...item?.textProps}
          type={'custom'}
          value={textValue}
          options={{ mask: `${item?.mask}` }}
          placeholder={placeholder}
          placeholderTextColor={Colors.BLACK}
          onChangeText={(value: any) => {
            setTextValue(value);
            const current = { ...payload.current };

            if (item.inputGroup) {
              if (!current[`${item.inputGroup}`]) {
                current[`${item.inputGroup}`] = {};
              }

              current[`${item.inputGroup}`][`${name}`] = value;
            } else {
              current[`${name}`] = value;
            }

            payload.current = current;
          }}
        />
      ) : (
        <TextInput
          {...item?.textProps}
          value={textValue}
          placeholder={placeholder}
          placeholderTextColor={Colors.BLACK}
          onChangeText={(value: any) => {
            setTextValue(value);
            const current = { ...payload.current };

            if (item.inputGroup) {
              if (!current[`${item.inputGroup}`]) {
                current[`${item.inputGroup}`] = {};
              }

              current[`${item.inputGroup}`][`${name}`] = value;
            } else {
              current[`${name}`] = value;
            }

            payload.current = current;
          }}
        />
      )}
    </Container>
  );
};

export default Input;
